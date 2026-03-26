import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Layout - minimal layout for login/register pages
// No Navbar or Footer to keep auth pages clean and focused
const AuthLayout = () => {
    return (
        <div className="min-h-screen">
            <Toaster position="top-right" />
            <Outlet />
        </div>
    );
};

export default AuthLayout;
