import React, { useContext, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/Authcontext/AuthContext';
import toast from 'react-hot-toast';

/**
 * PrivateRoute - General protected route for any authenticated user
 * - Requires authentication (either admin or student)
 * - Does NOT enforce specific role - use AdminRoute or StudentRoute for that
 * - Redirects unauthenticated users to signin (students) or admin-login (if on admin path)
 */
const PrivateRoute = ({ children }) => {
    const { user, loading, isAuthenticated, authStatus } = useContext(AuthContext);
    const location = useLocation();
    const hasShownToast = useRef(false);

    useEffect(() => {
        return () => {
            hasShownToast.current = false;
        };
    }, [location.pathname]);

    // Show loading spinner while auth state is being determined
    if (loading || authStatus === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // User is authenticated - allow access
    if (isAuthenticated && user) {
        return children;
    }

    // User is NOT authenticated - redirect to appropriate login
    if (!hasShownToast.current) {
        toast.error('Please sign in to continue');
        hasShownToast.current = true;
    }
    
    // Check if user was trying to access admin pages
    const isAdminPath = location.pathname.startsWith('/admin');
    const redirectTo = isAdminPath ? '/admin-login' : '/signin';
    
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
};

export default PrivateRoute;
