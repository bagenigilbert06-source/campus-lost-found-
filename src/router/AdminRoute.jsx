import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useContext(AuthContext);

    useEffect(() => {
        if (!loading && user && !isAdmin) {
            toast.error('Access denied: Admin access required');
        }
        if (!loading && !user) {
            toast.error('Please sign in first');
        }
    }, [loading, user, isAdmin]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-16 h-16 border-4 border-zetech-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user && isAdmin) {
        return children;
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    return <Navigate to="/" replace />;
};

export default AdminRoute;
