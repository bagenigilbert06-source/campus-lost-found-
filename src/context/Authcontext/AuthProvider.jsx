import React, { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  getIdToken 
} from 'firebase/auth';
import auth from '../../firebase/firebase.init';
import { schoolConfig } from '../../config/schoolConfig';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    // Create user with Firebase, then register profile in MongoDB
    const createUser = async (email, password, displayName, photoURL) => {
        setLoading(true);
        try {
            // Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update Firebase profile
            await updateProfile(firebaseUser, {
                displayName: displayName,
                photoURL: photoURL,
            });

            // Get Firebase ID token
            const token = await getIdToken(firebaseUser);
            localStorage.setItem('firebaseToken', token);

            // Register user profile in MongoDB
            try {
                await axios.post(`${API_URL}/auth/register`, {
                    email: firebaseUser.email,
                    displayName: displayName,
                    photoURL: photoURL,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (mongoErr) {
                console.warn('MongoDB registration note:', mongoErr.message);
                // Don't fail if user already exists in MongoDB
            }

            return firebaseUser;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    // Sign in with Firebase email/password
    const singInUser = async (email, password) => {
        setLoading(true);
        try {
            console.log("[v0] Firebase sign-in attempt for:", email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("[v0] Firebase sign-in successful for user:", userCredential.user.email);
            const token = await getIdToken(userCredential.user);
            console.log("[v0] Firebase token obtained successfully");
            localStorage.setItem('firebaseToken', token);
            setLoading(false);
            return userCredential;
        } catch (error) {
            console.error('[v0] Firebase sign-in error code:', error.code);
            console.error('[v0] Firebase sign-in error message:', error.message);
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

    // Sign in with Google
    const signInWithGoogle = async () => {
        const googleProvider = new GoogleAuthProvider();
        
        // Configure Google provider for popup
        googleProvider.setCustomParameters({
            'prompt': 'select_account',
            'login_hint': ''
        });
        
        setLoading(true);
        let userCredential = null;
        
        try {
            console.log("[v0] Attempting Google Sign-In with popup");
            userCredential = await signInWithPopup(auth, googleProvider);
            const firebaseUser = userCredential.user;
            console.log("[v0] Google Sign-In successful for user:", firebaseUser.email);
            
            const token = await getIdToken(firebaseUser);
            console.log("[v0] Firebase token obtained for Google user");
            localStorage.setItem('firebaseToken', token);

            // Sync Google user profile to MongoDB
            try {
                console.log("[v0] Syncing Google user to MongoDB");
                await axios.post(`${API_URL}/auth/register`, {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log("[v0] MongoDB sync successful");
            } catch (mongoErr) {
                console.warn('[v0] MongoDB sync warning (user may already exist):', mongoErr.response?.status === 409 ? 'User already exists' : mongoErr.message);
                // Continue even if sync fails - user is authenticated in Firebase
            }

            setLoading(false);
            return userCredential;
        } catch (error) {
            console.error('[v0] Google Sign-In error:', error.code, error.message);
            setLoading(false);
            
            // Re-throw with more context
            const errorMap = {
                'auth/popup-blocked': 'Popup was blocked by your browser. Please check your popup blocker settings.',
                'auth/popup-closed-by-user': 'Sign-in was cancelled.',
                'auth/configuration-not-found': 'Google Sign-In is not properly configured. Please contact support.',
                'auth/cancelled-popup-request': 'Another sign-in is already in progress.',
            };
            
            error.userFriendlyMessage = errorMap[error.code] || 'Failed to sign in with Google. Please try again.';
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

    // Monitor Firebase authentication state
    useEffect(() => {
        console.log("[v0] AuthProvider mounted - setting up auth state listener");
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("[v0] Auth state changed:", currentUser ? currentUser.email : "No user");
            setUser(currentUser);
            
            if (currentUser?.email) {
                try {
                    // Get and store Firebase ID token
                    const token = await getIdToken(currentUser);
                    console.log("[v0] Token obtained for user:", currentUser.email);
                    localStorage.setItem('firebaseToken', token);

                    // Set axios default header for API requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Determine user role
                    const role = determineUserRole(currentUser.email);
                    console.log("[v0] User role determined:", role);
                    setUserRole(role);

                    setLoading(false);
                } catch (err) {
                    console.error('[v0] Token retrieval error:', err);
                    setLoading(false);
                }
            } else {
                // Clear data on logout
                console.log("[v0] Clearing auth data");
                setUserRole(null);
                localStorage.removeItem('firebaseToken');
                delete axios.defaults.headers.common['Authorization'];
                setLoading(false);
            }
        });

        return () => {
            console.log("[v0] Cleaning up auth state listener");
            unSubscribe();
        };
    }, []);

    const authInfo = {
        user,
        loading,
        userRole,
        isAdmin: userRole === 'admin',
        createUser,
        singInUser,
        signOutUser,
        signInWithGoogle,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
