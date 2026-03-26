import React, { useContext, useEffect, useRef } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * StudentRoute - Protects student-only pages
 * - Requires authentication
 * - Requires student role (non-admin)
 * - Redirects admins to admin dashboard
 * - Redirects unauthenticated users to student signin
 */
const StudentRoute = ({ children }) => {
    const { user, loading, isStudent, isAdmin, isAuthenticated, authStatus } = useContext(AuthContext);
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
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // User is authenticated and is student - allow access
    if (isAuthenticated && user && isStudent) {
        return children;
    }

    // User is authenticated but is admin - redirect to admin dashboard
    if (isAuthenticated && user && isAdmin) {
        if (!hasShownToast.current) {
            toast('Redirecting to admin dashboard', { icon: 'i' });
            hasShownToast.current = true;
        }
        return <Navigate to="/admin" state={{ from: location }} replace />;
    }

    // User is NOT authenticated - redirect to student signin
    if (!hasShownToast.current) {
        toast.error('Please sign in to continue');
        hasShownToast.current = true;
    }
    return <Navigate to="/signin" state={{ from: location }} replace />;
};

export default StudentRoute;
