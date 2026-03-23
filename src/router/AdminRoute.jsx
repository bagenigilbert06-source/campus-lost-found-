import React, { useContext } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useContext(AuthContext);

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
        toast.error('Please sign in first');
        return <Navigate to="/signin" replace />;
    }

    toast.error('Access denied: Admin access required');
    return <Navigate to="/" replace />;
};

export default AdminRoute;
