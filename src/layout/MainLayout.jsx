import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../pages/common/Navbar';
import GeminiChatbot from '../components/GeminiChatbot';
import { Toaster } from 'react-hot-toast';
import Footer from '../pages/Footer/Footer';



const MainLayout = () => {
    return (
        <div className='max-w-7xl mx-auto'>
             <Toaster />
            <Navbar/>
            <Outlet/>
            <Footer/>
            <GeminiChatbot isAuthenticated={true} context="User is logged in and browsing the main platform." />
        </div>
    );
};

export default MainLayout;