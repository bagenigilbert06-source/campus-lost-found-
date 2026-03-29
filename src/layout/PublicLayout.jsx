import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../pages/common/PublicNavbar';
import Footer from '../pages/Footer/Footer';
import GeminiChatbot from '../components/GeminiChatbot';
import { Toaster } from 'react-hot-toast';

// Public Layout - For unauthenticated users
// Shows marketing site with home, items, about, contact
const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Toaster position="top-right" />
            <PublicNavbar />
            <main className="flex-grow max-w-7xl w-full mx-auto">
                <Outlet />
            </main>
            <Footer />
            <GeminiChatbot isAuthenticated={false} context="You are on a public page of the campus lost and found platform. The user is not authenticated yet." />
        </div>
    );
};

export default PublicLayout;
