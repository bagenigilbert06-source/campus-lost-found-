import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/login.json';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const AdminLogin = () => {
    const { singInUser, signInWithGoogle, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        console.log("[v0] Admin Sign In attempt with email:", email);

        setIsLoading(true);
        singInUser(email, password)
            .then(() => {
                console.log("[v0] Admin Sign In successful");
                
                // Check if user is admin - if not, log them out
                if (!isAdmin) {
                    toast.error('You do not have admin privileges');
                    navigate('/');
                    return;
                }
                
                toast.success('Admin signed in successfully!');
                navigate('/admin');
            })
            .catch((error) => {
                console.error('[v0] Admin signin error:', error);
                toast.error(error.message || "Cannot sign in, please try again.");
            })
            .finally(() => setIsLoading(false));
    };

    const handleGoogleSignIn = () => {
        console.log("[v0] Admin Google Sign-In initiated");
        setIsLoading(true);
        signInWithGoogle()
            .then(() => {
                console.log("[v0] Admin Google Sign-In successful");
                
                if (!isAdmin) {
                    toast.error('Your account does not have admin privileges');
                    navigate('/');
                    return;
                }
                
                toast.success('Admin signed in with Google!');
                navigate('/admin');
            })
            .catch((error) => {
                console.error('[v0] Admin Google Sign-In error:', error);
                toast.error(error.message || "Cannot sign in with Google. Try email/password.");
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 gap-8">
            <Helmet>
                <title>Admin Login - {schoolConfig.name}</title>
            </Helmet>

            {/* Lottie Animation */}
            <div className="hidden md:flex w-1/2 items-center justify-center">
                <Lottie
                    animationData={loginAnimation}
                    className="w-full max-w-md"
                />
            </div>

            {/* Login Form */}
            <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 border border-gray-200 border-l-4 border-l-orange-600">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                        🔐
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Lost & Found Office
                    </h1>
                </div>
                <p className="text-center text-gray-500 text-xs mb-5">Security Staff Portal</p>
                
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FcGoogle /> Sign in with Google
                </button>

                <div className="divider text-xs text-gray-400">OR</div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Office Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="admin@zetech.ac.ke"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                    <p className="font-semibold mb-1">Admin Access Only</p>
                    <p>This portal is restricted to authorized security staff only. Unauthorized access will be logged and reported.</p>
                </div>

                <p className="mt-4 text-center text-xs text-gray-600">
                    Not an admin?{' '}
                    <Link to="/signin" className="text-teal-600 hover:underline font-semibold">
                        Student Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
