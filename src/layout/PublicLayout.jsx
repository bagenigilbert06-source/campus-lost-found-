import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../pages/common/Navbar';
import Footer from '../pages/Footer/Footer';

const PublicLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
            <Toaster />
            <Navbar/>
            <Outlet/>
            <Footer/>
        </div>
    );
};

export default PublicLayout;
