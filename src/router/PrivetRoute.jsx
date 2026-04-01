import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/Authcontext/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// PrivateRoute - Requires authentication, allows any authenticated user
// Use UserRoute for student-only pages that should block admins
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
   
    if (loading) {
        return <LoadingScreen message="Checking session..." />;
    }

    if (user) {
        return children;
    }

    // Redirect to signin with return path
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
};

export default PrivateRoute;
