import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardNavbar from "../pages/common/DashboardNavbar";
import DashboardSidebar from "../pages/common/DashboardSidebar";
import { Toaster } from "react-hot-toast";

// Dashboard Layout - For authenticated users
// Shows sidebar navigation with dashboard, search, post, profile, etc.
const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Toaster position="top-right" />

            {/* Navbar */}
            <DashboardNavbar onToggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
