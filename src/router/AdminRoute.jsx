import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

// AdminRoute - Protected route for admin pages only
// Redirects non-admins to home, unauthenticated to admin-login
const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useContext(AuthContext);

    useEffect(() => {
        if (!loading && user && !isAdmin) {
            toast.error('Access denied: Admin access required');
        }
    }, [loading, user, isAdmin]);

    if (loading) {
        return <LoadingScreen message="Verifying admin access..." />;
    }

    // Admin user - allow access
    if (user && isAdmin) {
        return children;
    }

    // Not logged in - redirect to admin login
    if (!user) {
        return <Navigate to="/admin-login" replace />;
    }

    // Logged in but not admin - redirect to home
    return <Navigate to="/" replace />;
};

export default AdminRoute;
