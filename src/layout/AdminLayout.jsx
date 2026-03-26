import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

// Admin Layout - completely isolated from user/public layouts
// Has its own sidebar, header, and navigation system
const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Get page title from route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/admin') return 'Dashboard';
        if (path.includes('/admin/items')) return 'All Items';
        if (path.includes('/admin/pending')) return 'Pending Review';
        if (path.includes('/admin/users')) return 'Users';
        if (path.includes('/admin/messages')) return 'Messages';
        if (path.includes('/admin/recovered')) return 'Recovered Items';
        if (path.includes('/admin/analytics')) return 'Analytics';
        if (path.includes('/admin/settings')) return 'Settings';
        return 'Admin';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'font-medium',
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            
            {/* Sidebar */}
            <AdminSidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                isMobile={isMobile}
            />

            {/* Main Content Area */}
            <div className={`${!isMobile ? 'lg:ml-64' : ''} min-h-screen flex flex-col transition-all duration-300`}>
                {/* Header */}
                <AdminHeader 
                    onMenuClick={() => setSidebarOpen(true)}
                    pageTitle={getPageTitle()}
                />

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-slate-200 px-6 py-4">
                    <p className="text-center text-sm text-slate-500">
                        Zetech University Lost & Found Admin Portal
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
