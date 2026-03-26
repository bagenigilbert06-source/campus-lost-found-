import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/login.json';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

/**
 * Student Sign In Page
 * - For students/regular users only
 * - Admins should use /admin-login
 * - Redirects to student dashboard after successful login
 */
const Signin = () => {
    const { signInWithEmail, signInWithGoogle, getRedirectPath, USER_ROLES } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get the intended destination or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSignin = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value.trim();
        const password = form.password.value;

        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setIsLoading(true);

        try {
            const { role } = await signInWithEmail(email, password);
            
            toast.success('Successfully signed in!');
            
            // Role-based redirect
            if (role === USER_ROLES.ADMIN) {
                // Admin tried to sign in through student login - redirect to admin
                toast('Redirecting to admin dashboard', { icon: 'info' });
                navigate('/admin', { replace: true });
            } else {
                // Student - go to intended destination or dashboard
                const destination = from.startsWith('/admin') ? '/dashboard' : from;
                navigate(destination, { replace: true });
            }
        } catch (error) {
            console.error('Signin error:', error);
            toast.error(error.message || "Cannot sign in, please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);

        try {
            const { role } = await signInWithGoogle();
            
            toast.success('Successfully signed in with Google!');
            
            // Role-based redirect
            if (role === USER_ROLES.ADMIN) {
                toast('Redirecting to admin dashboard', { icon: 'info' });
                navigate('/admin', { replace: true });
            } else {
                const destination = from.startsWith('/admin') ? '/dashboard' : from;
                navigate(destination, { replace: true });
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            const errorMessage = error.userFriendlyMessage || error.message || "Cannot sign in with Google. Try email/password.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 gap-8">
            <Helmet>
                <title>Sign In - {schoolConfig.name} Lost & Found</title>
            </Helmet>

            {/* Lottie Animation */}
            <div className="hidden md:flex w-1/2 items-center justify-center">
                <Lottie
                    animationData={loginAnimation}
                    className="w-full max-w-md"
                />
            </div>

            {/* Login Form */}
            <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <h1 className="text-2xl font-bold text-center mb-1 text-gray-900">
                    Sign In to {schoolConfig.shortName}
                </h1>
                <p className="text-center text-gray-500 text-xs mb-5">Welcome back, student</p>
                
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FcGoogle size={20} />
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">Or email</span>
                    </div>
                </div>

                <form onSubmit={handleSignin} className="space-y-3">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                        required
                        disabled={isLoading}
                    />
                    
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                        >
                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                    </div>

                    <div className="text-right">
                        <a href="#" className="text-xs text-teal-600 hover:underline">
                            Forgot password?
                        </a>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-teal-700 transition duration-300 text-sm mt-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="text-center mt-4 text-gray-600 text-xs">
                    {"Don't have an account? "}
                    <Link to="/register" className="text-teal-600 hover:underline font-semibold">
                        Register
                    </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-2">Are you a staff member?</p>
                    <Link 
                        to="/admin-login" 
                        className="text-xs text-orange-600 hover:underline font-semibold"
                    >
                        Admin / Security Staff Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signin;
