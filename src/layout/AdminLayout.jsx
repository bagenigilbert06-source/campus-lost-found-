import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminHeader from '../components/admin/AdminHeader';

// Admin Layout - completely isolated from user/public layouts
// Unified design with top navigation bar
const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Toaster position="top-right" />
            
            {/* Top Navigation Header */}
            <AdminHeader />

            {/* Main Content Area */}
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
