import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/login.json';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

/**
 * Admin Login Page
 * - For security staff/admins only
 * - Students should use /signin
 * - Validates admin role and redirects to admin dashboard
 */
const AdminLogin = () => {
    const { signInUser, signInWithGoogle, USER_ROLES } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get the intended destination or default to admin dashboard
    const from = location.state?.from?.pathname || '/admin';

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        setIsLoading(true);

        try {
            const { role } = await signInUser(email, password);
            
            // Check if user has admin privileges
            if (role !== USER_ROLES.ADMIN) {
                toast.error('You do not have admin privileges. Please use the student login.');
                // Sign them out or redirect to student dashboard
                navigate('/dashboard', { replace: true });
                return;
            }
            
            toast.success('Admin signed in successfully!');
            
            // Redirect to intended admin page or admin dashboard
            const destination = from.startsWith('/admin') ? from : '/admin';
            navigate(destination, { replace: true });
        } catch (error) {
            console.error('Admin signin error:', error);
            toast.error(error.message || "Cannot sign in, please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);

        try {
            const { role } = await signInWithGoogle();
            
            // Check if user has admin privileges
            if (role !== USER_ROLES.ADMIN) {
                toast.error('Your Google account does not have admin privileges.');
                navigate('/dashboard', { replace: true });
                return;
            }
            
            toast.success('Admin signed in with Google!');
            
            const destination = from.startsWith('/admin') ? from : '/admin';
            navigate(destination, { replace: true });
        } catch (error) {
            console.error('Admin Google Sign-In error:', error);
            toast.error(error.message || "Cannot sign in with Google. Try email/password.");
        } finally {
            setIsLoading(false);
        }
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
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                        <FaShieldAlt className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Lost & Found Office
                        </h1>
                        <p className="text-xs text-gray-500">Security Staff Portal</p>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FcGoogle size={20} />
                    {isLoading ? 'Verifying...' : 'Sign in with Google'}
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-400">OR</span>
                    </div>
                </div>

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
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {isLoading ? 'Verifying Admin Access...' : 'Sign In as Admin'}
                    </button>
                </form>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <p className="font-semibold mb-1">Admin Access Only</p>
                    <p>This portal is restricted to authorized security staff only. Unauthorized access attempts will be logged.</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-2">Are you a student?</p>
                    <Link 
                        to="/signin" 
                        className="text-xs text-teal-600 hover:underline font-semibold"
                    >
                        Student Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
