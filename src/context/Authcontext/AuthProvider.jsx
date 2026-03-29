import React, { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  getIdToken 
} from 'firebase/auth';
import auth from '../../firebase/firebase.init';
import { schoolConfig } from '../../config/schoolConfig';
import axios from 'axios';
import {
  signInWithGoogleSmartFlow,
  handleGoogleSignInRedirectResult,
  getGoogleAuthErrorMessage,
  clearRedirectState,
} from '../../utils/googleAuthUtils';
import { uploadProfilePhoto } from '../../utils/storageUtils';
import { 
  getIntendedPath, 
  clearIntendedPath,
  getFinalRedirectPath 
} from '../../utils/authRedirectManager';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    // Create user with Firebase, then register profile in MongoDB
    const createUser = async (email, password, displayName, photoFile) => {
        setLoading(true);
        try {
            // Step 1: Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const firebaseUid = firebaseUser.uid;

            console.log('Firebase user created with UID:', firebaseUid);

            // Step 2: Upload photo to Firebase Storage if provided
            let photoURL = '';
            if (photoFile && photoFile instanceof File) {
                try {
                    console.log('Uploading profile photo...');
                    photoURL = await uploadProfilePhoto(photoFile, firebaseUid);
                    console.log('Photo uploaded successfully:', photoURL);
                } catch (uploadError) {
                    console.warn('Photo upload failed, continuing without photo:', uploadError.message);
                    // Don't fail registration if photo upload fails
                    photoURL = '';
                }
            }

            // Step 3: Update Firebase profile with photo URL
            await updateProfile(firebaseUser, {
                displayName: displayName,
                photoURL: photoURL || '',
            });

            // Step 4: Get Firebase ID token
            const token = await getIdToken(firebaseUser);
            localStorage.setItem('firebaseToken', token);

            // Step 5: Register user profile in MongoDB
            try {
                await axios.post(`${API_URL}/auth/register`, {
                    email: firebaseUser.email,
                    displayName: displayName,
                    photoURL: photoURL || '',
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (mongoErr) {
                // Don't fail if user already exists in MongoDB
                if (mongoErr.response?.status !== 409) {
                    console.error('MongoDB registration error:', mongoErr.message);
                }
            }

            setLoading(false);
            return firebaseUser;
        } catch (error) {
            console.error('Firebase user creation error:', error.code, error.message);
            setLoading(false);
            throw error;
        }
    };

    // Sign in with Firebase email/password
    const singInUser = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await getIdToken(userCredential.user);
            localStorage.setItem('firebaseToken', token);
            
            // Sync user to MongoDB to ensure database record exists
            await syncUserProfileToDatabase(userCredential.user).catch(err => 
              console.warn('Profile sync error:', err.message)
            );
            
            setLoading(false);
            return userCredential;
        } catch (error) {
            console.error('Firebase sign-in error:', error.code, error.message);
            setLoading(false);
            throw error;
        }
    };

    // Sign out user
    const signOutUser = async () => {
        setLoading(true);
        localStorage.removeItem('firebaseToken');
        return signOut(auth);
    };

    // Sign in with Google - Smart popup/redirect with automatic fallback
    const signInWithGoogle = async () => {
        setLoading(true);
        
        try {
            // Use smart flow: tries popup on desktop, redirect on mobile, fallback from popup to redirect
            const result = await signInWithGoogleSmartFlow(
                auth,
                () => {
                  // Callback when redirect is used
                  // Don't set loading to false - auth state listener will handle it
                  console.log('Google sign-in: redirect flow initiated...');
                }
            );

            // If popup succeeded, result will contain user
            if (result) {
                // Popup succeeded - get and store token
                const token = await getIdToken(result.user);
                localStorage.setItem('firebaseToken', token);
                
                // Sync with database in background (don't await to prevent blocking redirect)
                syncUserProfileToDatabase(result.user).catch(err => 
                  console.warn('Background sync error:', err.message)
                );
                
                // Auth state listener will handle the rest
                return result;
            }

            // Redirect flow was used - user will be redirected to Google
            // Loading state will be updated by auth state listener when user returns
            return null;
        } catch (error) {
            console.error('Google Sign-In failed:', {
                code: error.code,
                message: error.message,
                type: error.constructor.name,
                fullError: error
            });
            setLoading(false);
            clearRedirectState();
            
            // Add user-friendly error message
            error.userFriendlyMessage = getGoogleAuthErrorMessage(error.code);
            throw error;
        }
    };

    // Determine user role based on email
    const determineUserRole = (userEmail) => {
        if (!userEmail) return null;
        if (schoolConfig.adminEmails.includes(userEmail)) {
            return 'admin';
        }
        return 'student';
    };

    // Sync user profile with MongoDB after auth
    const syncUserProfileToDatabase = async (firebaseUser) => {
        if (!firebaseUser?.email) return;

        try {
            const token = await getIdToken(firebaseUser);
            
            await axios.post(`${API_URL}/auth/register`, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (mongoErr) {
            // Don't fail auth if sync fails - user is authenticated in Firebase
            if (mongoErr.response?.status !== 409) {
                console.warn('MongoDB profile sync error:', mongoErr.message);
            }
        }
    };

    // Monitor Firebase authentication state and handle redirects
    useEffect(() => {
        let unsubscribe;
        let isComponentMounted = true;
        let redirectResultHandled = false;

        const initializeAuth = async () => {
            try {
                // Step 1: Check if user is returning from Google sign-in redirect
                try {
                    const redirectResult = await handleGoogleSignInRedirectResult(auth);
                    
                    if (redirectResult && redirectResult.user && isComponentMounted) {
                        // User successfully signed in via redirect
                        const firebaseUser = redirectResult.user;
                        redirectResultHandled = true;
                        
                        // Store token
                        const token = await getIdToken(firebaseUser);
                        localStorage.setItem('firebaseToken', token);
                        
                        // Sync with database in background (don't block auth state update)
                        syncUserProfileToDatabase(firebaseUser).catch(err => 
                          console.warn('Background sync error:', err.message)
                        );
                    }
                } catch (redirectError) {
                    console.error('Handling redirect result:', redirectError.code, redirectError.message);
                    // Continue - auth state listener will verify user state
                } finally {
                    // Clear redirect state flag after handling
                    clearRedirectState();
                }

                // Step 2: Set up auth state listener
                // This runs AFTER redirect result check, ensuring no auth flicker
                if (isComponentMounted) {
                    unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                        if (!isComponentMounted) return;

                        try {
                            if (currentUser?.email) {
                                // User is authenticated
                                const token = await getIdToken(currentUser);
                                localStorage.setItem('firebaseToken', token);

                                // Set axios default header for all API requests
                                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                                // Sync user to MongoDB to ensure database record exists
                                await syncUserProfileToDatabase(currentUser).catch(err => 
                                  console.warn('Background sync error:', err.message)
                                );

                                // Determine user role
                                const role = determineUserRole(currentUser.email);
                                
                                // Update state with user and role
                                setUser(currentUser);
                                setUserRole(role);
                            } else {
                                // User is logged out
                                setUser(null);
                                setUserRole(null);
                                localStorage.removeItem('firebaseToken');
                                delete axios.defaults.headers.common['Authorization'];
                            }
                        } catch (err) {
                            console.error('Auth state update error:', err.message);
                        } finally {
                            // Finish loading once auth state is settled
                            if (isComponentMounted) {
                                setLoading(false);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Auth initialization error:', error.message);
                if (isComponentMounted) {
                    setLoading(false);
                }
            }
        };

        // Start auth initialization
        initializeAuth();

        // Cleanup function
        return () => {
            isComponentMounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const updateUserProfile = (updates) => {
        setUser((prevUser) => {
            if (!prevUser) return prevUser;
            return {
                ...prevUser,
                ...updates,
            };
        });
    };

    const authInfo = {
        user,
        loading,
        userRole,
        isAdmin: userRole === 'admin',
        createUser,
        singInUser,
        signOutUser,
        signInWithGoogle,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
