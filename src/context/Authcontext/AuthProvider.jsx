import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

// Auth state constants
export const AUTH_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
};

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

const AuthProvider = ({ children }) => {
    // Core auth state
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [authStatus, setAuthStatus] = useState(AUTH_STATUS.LOADING);
    
    // Derived state for convenience
    const loading = authStatus === AUTH_STATUS.LOADING;
    const isAuthenticated = authStatus === AUTH_STATUS.AUTHENTICATED;
    const isAdmin = userRole === USER_ROLES.ADMIN;
    const isStudent = userRole === USER_ROLES.STUDENT;

    // Determine user role based on email (admin emails from config)
    const determineUserRole = useCallback((userEmail) => {
        if (!userEmail) return null;
        if (schoolConfig.adminEmails.includes(userEmail.toLowerCase())) {
            return USER_ROLES.ADMIN;
        }
        return USER_ROLES.STUDENT;
    }, []);

    // Get the appropriate redirect path based on role
    const getRedirectPath = useCallback((role) => {
        if (role === USER_ROLES.ADMIN) {
            return '/admin';
        }
        return '/dashboard';
    }, []);

    // Create user with Firebase, then register profile in MongoDB
    const createUser = async (email, password, displayName, photoURL, isAdminSignup = false) => {
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

            // Determine the role for this user
            const role = determineUserRole(email);

            // Register user profile in MongoDB with role-specific defaults
            try {
                await axios.post(`${API_URL}/auth/register`, {
                    email: firebaseUser.email,
                    displayName: displayName,
                    photoURL: photoURL,
                    role: role,
                    // Student-specific defaults
                    ...(role === USER_ROLES.STUDENT && {
                        studentProfile: {
                            onboardingComplete: false,
                            preferences: {},
                            createdAt: new Date().toISOString()
                        }
                    }),
                    // Admin-specific defaults
                    ...(role === USER_ROLES.ADMIN && {
                        adminProfile: {
                            permissions: ['verify_items', 'manage_users'],
                            createdAt: new Date().toISOString()
                        }
                    })
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (mongoErr) {
                console.warn('MongoDB registration note:', mongoErr.message);
                // Continue even if MongoDB sync fails - user is authenticated in Firebase
            }

            return { user: firebaseUser, role };
        } catch (error) {
            throw error;
        }
    };

    // Sign in with Firebase email/password
    const signInUser = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await getIdToken(userCredential.user);
            localStorage.setItem('firebaseToken', token);
            
            // Return the role for immediate redirect decision
            const role = determineUserRole(email);
            return { user: userCredential.user, role };
        } catch (error) {
            throw error;
        }
    };

    // Legacy alias for backward compatibility
    const singInUser = signInUser;

    // Sign out user
    const signOutUser = async () => {
        localStorage.removeItem('firebaseToken');
        setUserRole(null);
        return signOut(auth);
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        const googleProvider = new GoogleAuthProvider();
        
        googleProvider.setCustomParameters({
            'prompt': 'select_account',
            'login_hint': ''
        });
        
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            const firebaseUser = userCredential.user;
            
            const token = await getIdToken(firebaseUser);
            localStorage.setItem('firebaseToken', token);

            // Determine the role for this user
            const role = determineUserRole(firebaseUser.email);

            // Sync Google user profile to MongoDB
            try {
                await axios.post(`${API_URL}/auth/register`, {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    role: role,
                    ...(role === USER_ROLES.STUDENT && {
                        studentProfile: {
                            onboardingComplete: false,
                            preferences: {},
                            createdAt: new Date().toISOString()
                        }
                    }),
                    ...(role === USER_ROLES.ADMIN && {
                        adminProfile: {
                            permissions: ['verify_items', 'manage_users'],
                            createdAt: new Date().toISOString()
                        }
                    })
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            } catch (mongoErr) {
                console.warn('MongoDB sync warning:', mongoErr.message);
            }

            return { user: firebaseUser, role };
        } catch (error) {
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

    // Monitor Firebase authentication state
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser?.email) {
                try {
                    // Get and store Firebase ID token
                    const token = await getIdToken(currentUser);
                    localStorage.setItem('firebaseToken', token);

                    // Set axios default header for API requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Determine and set user role
                    const role = determineUserRole(currentUser.email);
                    
                    setUser(currentUser);
                    setUserRole(role);
                    setAuthStatus(AUTH_STATUS.AUTHENTICATED);
                } catch (err) {
                    console.error('Token retrieval error:', err);
                    setUser(null);
                    setUserRole(null);
                    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
                }
            } else {
                // Clear data on logout
                setUser(null);
                setUserRole(null);
                localStorage.removeItem('firebaseToken');
                delete axios.defaults.headers.common['Authorization'];
                setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
            }
        });

        return () => unSubscribe();
    }, [determineUserRole]);

    // Memoize auth context value
    const authInfo = useMemo(() => ({
        // State
        user,
        userRole,
        authStatus,
        loading,
        isAuthenticated,
        isAdmin,
        isStudent,
        
        // Methods
        createUser,
        signInUser,
        singInUser, // Legacy alias
        signOutUser,
        signInWithGoogle,
        
        // Helpers
        determineUserRole,
        getRedirectPath,
        
        // Constants
        AUTH_STATUS,
        USER_ROLES
    }), [user, userRole, authStatus, loading, isAuthenticated, isAdmin, isStudent, determineUserRole, getRedirectPath]);

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
