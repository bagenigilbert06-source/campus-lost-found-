import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../pages/common/Navbar';
import Footer from '../pages/Footer/Footer';
import { Toaster } from 'react-hot-toast';

// User/Student Layout - includes Navbar and Footer
// Used for all authenticated student pages
const UserLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
            <Toaster position="top-right" />
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default UserLayout;
