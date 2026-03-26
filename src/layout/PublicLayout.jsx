import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../pages/common/Navbar';
import Footer from '../pages/Footer/Footer';
import { Toaster } from 'react-hot-toast';

// Public Layout - includes Navbar and Footer for public pages
// Used for home, about, contact, login, register, etc.
const PublicLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
            <Toaster position="top-right" />
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default PublicLayout;
