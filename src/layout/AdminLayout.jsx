import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

// Admin Layout - completely isolated from user/public layouts
// No Navbar, No Footer - admin pages have their own internal navigation
const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            {/* Sidebar */}
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Main Content */}
            <div className="md:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <AdminHeader 
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                {/* Page Content */}
                <main className="flex-1 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
