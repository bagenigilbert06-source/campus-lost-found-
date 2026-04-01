import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/Authcontext/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// UserRoute - Protected route for student/user pages only
// Blocks admin users and redirects them to admin dashboard
const UserRoute = ({ children }) => {
    const { user, loading, isAdmin } = useContext(AuthContext);

    if (loading) {
        return <LoadingScreen message="Checking user session..." />;
    }

    // Not logged in - redirect to signin
    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    // Admin users should not access student pages - redirect to admin dashboard
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    // Regular user - allow access
    return children;
};

export default UserRoute;
