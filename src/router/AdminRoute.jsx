import React, { useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * AdminRoute - Protects admin-only pages
 * - Requires authentication
 * - Requires admin role
 * - Redirects non-admins to home with error message
 * - Redirects unauthenticated users to admin login
 */
const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin, isAuthenticated, authStatus } = useContext(AuthContext);
    const location = useLocation();
    const hasShownToast = useRef(false);

    useEffect(() => {
        // Reset toast flag when component unmounts or location changes
        return () => {
            hasShownToast.current = false;
        };
    }, [location.pathname]);

    // Show loading spinner while auth state is being determined
    if (loading || authStatus === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // User is authenticated and is admin - allow access
    if (isAuthenticated && user && isAdmin) {
        return children;
    }

    // User is authenticated but NOT admin - redirect to home
    if (isAuthenticated && user && !isAdmin) {
        if (!hasShownToast.current) {
            toast.error('Access denied: Admin privileges required');
            hasShownToast.current = true;
        }
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // User is NOT authenticated - redirect to admin login
    if (!hasShownToast.current) {
        toast.error('Please sign in as admin to continue');
        hasShownToast.current = true;
    }
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
};

export default AdminRoute;
