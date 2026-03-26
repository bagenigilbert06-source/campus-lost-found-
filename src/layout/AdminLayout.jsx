import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Layout - completely isolated from user/public layouts
// No Navbar, No Footer - admin pages have their own internal navigation
const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-right" />
            <Outlet />
        </div>
    );
};

export default AdminLayout;
