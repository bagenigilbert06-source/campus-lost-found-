import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
    return (
        <div>
            <Toaster />
            <Outlet/>
        </div>
    );
};

export default AdminLayout;
