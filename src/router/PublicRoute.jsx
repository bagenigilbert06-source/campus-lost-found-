import React, { useContext } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * PublicRoute - For auth pages (login/signup) that should redirect authenticated users
 * - If user is logged in as admin -> redirect to admin dashboard
 * - If user is logged in as student -> redirect to student dashboard
 * - Otherwise -> show the public page (login/signup)
 * 
 * @param {string} redirectTo - Optional specific path to redirect to
 * @param {boolean} adminOnly - If true, only redirect admins (for admin login page)
 */
const PublicRoute = ({ children, redirectTo, adminOnly = false }) => {
    const { user, loading, isAdmin, isStudent, isAuthenticated, authStatus, getRedirectPath, userRole } = useContext(AuthContext);
    const location = useLocation();

    // Show loading spinner while auth state is being determined
    if (loading || authStatus === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated, redirect based on role
    if (isAuthenticated && user) {
        // For admin-only public routes (like admin login), only redirect admins
        if (adminOnly && !isAdmin) {
            return children;
        }
        
        // Determine redirect path
        const destination = redirectTo || getRedirectPath(userRole);
        
        // If we came from somewhere, try to go back there (unless it's an auth page)
        const from = location.state?.from?.pathname;
        const isAuthPage = from && ['/signin', '/register', '/admin-login', '/admin-signup'].includes(from);
        
        if (from && !isAuthPage) {
            return <Navigate to={from} replace />;
        }
        
        return <Navigate to={destination} replace />;
    }

    // Not authenticated - show the public page
    return children;
};

export default PublicRoute;
