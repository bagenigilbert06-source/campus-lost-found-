import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AuthContext from './AuthContext';
import { 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
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

// Auth provider constants
export const AUTH_PROVIDERS = {
  LOCAL: 'local',
  GOOGLE: 'google'
};

const AuthProvider = ({ children }) => {
    // Core auth state
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [authProvider, setAuthProvider] = useState(null);
    const [authStatus, setAuthStatus] = useState(AUTH_STATUS.LOADING);
    
    // Derived state for convenience
    const loading = authStatus === AUTH_STATUS.LOADING;
    const isAuthenticated = authStatus === AUTH_STATUS.AUTHENTICATED;
    const isAdmin = userRole === USER_ROLES.ADMIN;
    const isStudent = userRole === USER_ROLES.STUDENT;

    // Determine user role based on email (admin emails from config)
    const determineUserRole = useCallback((userEmail) => {
        if (!userEmail) return USER_ROLES.STUDENT;
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

    // ============================================
    // LOCAL AUTH METHODS (Email/Password)
    // ============================================

    /**
     * Register with email and password (local auth)
     */
    const registerWithEmail = async (email, password, displayName, photoURL = '') => {
        try {
            const response = await axios.post(`${API_URL}/auth/local/register`, {
                email,
                password,
                displayName,
                photoURL
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Registration failed');
            }

            const { user: userData, token } = response.data;

            // Store the local token
            localStorage.setItem('authToken', token);
            localStorage.setItem('authProvider', AUTH_PROVIDERS.LOCAL);

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Update state
            setUser({
                uid: userData._id,
                email: userData.email,
                displayName: userData.displayName,
                photoURL: userData.profileImage,
            });
            setUserRole(userData.role);
            setAuthProvider(AUTH_PROVIDERS.LOCAL);
            setAuthStatus(AUTH_STATUS.AUTHENTICATED);

            return { user: userData, role: userData.role };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Registration failed';
            throw new Error(message);
        }
    };

    /**
     * Sign in with email and password (local auth)
     */
    const signInWithEmail = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/local/login`, {
                email,
                password
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Login failed');
            }

            const { user: userData, token } = response.data;

            // Store the local token
            localStorage.setItem('authToken', token);
            localStorage.setItem('authProvider', AUTH_PROVIDERS.LOCAL);

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Update state
            setUser({
                uid: userData._id,
                email: userData.email,
                displayName: userData.displayName,
                photoURL: userData.profileImage,
            });
            setUserRole(userData.role);
            setAuthProvider(AUTH_PROVIDERS.LOCAL);
            setAuthStatus(AUTH_STATUS.AUTHENTICATED);

            return { user: userData, role: userData.role };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(message);
        }
    };

    // Legacy aliases for backward compatibility
    const signInUser = signInWithEmail;
    const singInUser = signInWithEmail;
    const createUser = async (email, password, displayName, photoURL) => {
        return registerWithEmail(email, password, displayName, photoURL);
    };

    // ============================================
    // GOOGLE AUTH METHODS
    // ============================================

    /**
     * Sign in with Google (Firebase)
     */
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
            localStorage.setItem('authToken', token);
            localStorage.setItem('authProvider', AUTH_PROVIDERS.GOOGLE);

            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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
                });
            } catch (mongoErr) {
                console.warn('MongoDB sync warning:', mongoErr.message);
            }

            // Update state
            setUser(firebaseUser);
            setUserRole(role);
            setAuthProvider(AUTH_PROVIDERS.GOOGLE);
            setAuthStatus(AUTH_STATUS.AUTHENTICATED);

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

    // ============================================
    // SIGN OUT
    // ============================================

    /**
     * Sign out user (works for both auth providers)
     */
    const signOutUser = async () => {
        const currentProvider = localStorage.getItem('authProvider');
        
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authProvider');
        
        // Clear axios header
        delete axios.defaults.headers.common['Authorization'];
        
        // Clear state
        setUser(null);
        setUserRole(null);
        setAuthProvider(null);
        setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);

        // If Google auth, also sign out from Firebase
        if (currentProvider === AUTH_PROVIDERS.GOOGLE) {
            try {
                await firebaseSignOut(auth);
            } catch (error) {
                console.warn('Firebase sign out warning:', error);
            }
        }
    };

    // ============================================
    // SESSION RESTORATION
    // ============================================

    /**
     * Restore session on page load
     */
    const restoreSession = useCallback(async () => {
        const storedProvider = localStorage.getItem('authProvider');
        const storedToken = localStorage.getItem('authToken');

        if (!storedToken) {
            setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
            return;
        }

        // Set axios header for API calls
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        if (storedProvider === AUTH_PROVIDERS.LOCAL) {
            // Verify local token
            try {
                const response = await axios.post(`${API_URL}/auth/local/verify`);
                
                if (response.data.success && response.data.user) {
                    const userData = response.data.user;
                    setUser({
                        uid: userData._id,
                        email: userData.email,
                        displayName: userData.displayName,
                        photoURL: userData.profileImage,
                    });
                    setUserRole(userData.role);
                    setAuthProvider(AUTH_PROVIDERS.LOCAL);
                    setAuthStatus(AUTH_STATUS.AUTHENTICATED);
                } else {
                    // Token invalid, clear auth
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authProvider');
                    delete axios.defaults.headers.common['Authorization'];
                    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
                }
            } catch (error) {
                console.error('Local session restore failed:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authProvider');
                delete axios.defaults.headers.common['Authorization'];
                setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
            }
        }
        // Google auth will be handled by Firebase onAuthStateChanged
    }, []);

    // ============================================
    // AUTH STATE MONITORING
    // ============================================

    // Monitor Firebase authentication state (for Google auth)
    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            const storedProvider = localStorage.getItem('authProvider');
            
            // If using local auth, don't process Firebase state changes
            if (storedProvider === AUTH_PROVIDERS.LOCAL) {
                return;
            }

            if (currentUser?.email) {
                try {
                    // Get and store Firebase ID token
                    const token = await getIdToken(currentUser);
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('authProvider', AUTH_PROVIDERS.GOOGLE);

                    // Set axios default header for API requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Determine and set user role
                    const role = determineUserRole(currentUser.email);
                    
                    setUser(currentUser);
                    setUserRole(role);
                    setAuthProvider(AUTH_PROVIDERS.GOOGLE);
                    setAuthStatus(AUTH_STATUS.AUTHENTICATED);
                } catch (err) {
                    console.error('Token retrieval error:', err);
                    setUser(null);
                    setUserRole(null);
                    setAuthProvider(null);
                    setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
                }
            } else if (storedProvider !== AUTH_PROVIDERS.LOCAL) {
                // Clear data on logout (only if not using local auth)
                setUser(null);
                setUserRole(null);
                setAuthProvider(null);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authProvider');
                delete axios.defaults.headers.common['Authorization'];
                setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
            }
        });

        return () => unSubscribe();
    }, [determineUserRole]);

    // Restore local auth session on mount
    useEffect(() => {
        const storedProvider = localStorage.getItem('authProvider');
        if (storedProvider === AUTH_PROVIDERS.LOCAL) {
            restoreSession();
        }
    }, [restoreSession]);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    // Memoize auth context value
    const authInfo = useMemo(() => ({
        // State
        user,
        userRole,
        authProvider,
        authStatus,
        loading,
        isAuthenticated,
        isAdmin,
        isStudent,
        
        // Local auth methods
        registerWithEmail,
        signInWithEmail,
        
        // Google auth methods
        signInWithGoogle,
        
        // Legacy aliases (for backward compatibility)
        createUser,
        signInUser,
        singInUser,
        
        // Sign out
        signOutUser,
        
        // Helpers
        determineUserRole,
        getRedirectPath,
        restoreSession,
        
        // Constants
        AUTH_STATUS,
        USER_ROLES,
        AUTH_PROVIDERS
    }), [
        user, 
        userRole, 
        authProvider, 
        authStatus, 
        loading, 
        isAuthenticated, 
        isAdmin, 
        isStudent, 
        determineUserRole, 
        getRedirectPath,
        restoreSession
    ]);

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
