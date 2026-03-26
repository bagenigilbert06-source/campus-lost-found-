import React from 'react';
import Lottie from 'lottie-react';
import lottie404Animation from '../../assets/404.json'; 
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const ErrorPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zetech-light p-6">
             <Helmet>
                <title>{`Page Not Found - ${schoolConfig.name}`}</title>
             </Helmet>
            <div className="max-w-lg w-full">
                <Lottie animationData={lottie404Animation} className="w-full h-auto mb-8" />
            </div>
            <h1 
                className="text-4xl font-extrabold text-zetech-primary mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
            >
                Oops! Page Not Found
            </h1>
            <p 
                className="text-gray-600 text-center mb-6"
                style={{ fontFamily: 'Lato, sans-serif' }}
            >
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link 
                to="/" 
                className="py-3 px-6 bg-zetech-primary text-white rounded-lg shadow hover:bg-zetech-accent hover:shadow-lg hover:scale-105 transition duration-300"
            >
                Go to Home
            </Link>
        </div>
    );
};

export default ErrorPage;
