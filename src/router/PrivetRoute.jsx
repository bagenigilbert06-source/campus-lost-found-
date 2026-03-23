import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/Authcontext/AuthContext';


const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
   
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-dots loading-md"></span>
            </div>
        );
    }

    
    if (user) {
        return children;
    }

  
    return <Navigate to="/signin" state={location?.pathname} />;
};

export default PrivateRoute;
