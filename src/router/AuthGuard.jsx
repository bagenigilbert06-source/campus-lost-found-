import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/Authcontext/AuthContext';
import { schoolConfig } from '../config/schoolConfig';
import LoadingScreen from '../components/LoadingScreen';

// AuthGuard - Prevents authenticated users from accessing auth pages (/signin, /register, /admin-login)
// Only redirects if user is FULLY authenticated AND auth state is settled
// Allows auth pages to handle their own redirect logic on successful auth
const AuthGuard = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // While auth state is being checked, show loading spinner
    if (loading) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    // If user is already logged in AND auth state is settled (loading = false),
    // redirect to appropriate dashboard
    // This prevents them from seeing auth pages they don't need
    if (user && !loading) {
        const isAdminUser = schoolConfig.adminEmails.includes(user?.email?.toLowerCase());
        const redirectPath = isAdminUser ? '/admin' : '/app/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    // Not logged in (or loading) - allow access to auth page
    return children;
};

export default AuthGuard;
