import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/Authcontext/AuthContext';
import { schoolConfig } from '../config/schoolConfig';

// AuthGuard - Prevents authenticated users from accessing auth pages
// Redirects logged-in users to their appropriate dashboard
const AuthGuard = ({ children }) => {
    const { user, loading, isAdmin } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-dots loading-md"></span>
            </div>
        );
    }

    // If user is already logged in, redirect to appropriate dashboard
    if (user) {
        const isAdminUser = schoolConfig.adminEmails.includes(user?.email?.toLowerCase());
        if (isAdminUser) {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/app/dashboard" replace />;
        }
    }

    // Not logged in - allow access to auth page
    return children;
};

export default AuthGuard;
