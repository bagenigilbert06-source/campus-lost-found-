import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import loginAnimation from '../../assets/login.json';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const Signin = () => {
    const { singInUser, signInWithGoogle, user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Effect: Redirect after successful authentication
    useEffect(() => {
      if (user && !loading && !isLoading) {
        const isAdminEmail = schoolConfig.adminEmails.includes(user?.email?.toLowerCase());
        const redirectPath = isAdminEmail ? '/admin' : '/app/dashboard';
        
        // Small delay to ensure auth state is fully settled
        const timer = setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, [user, loading, isLoading, navigate]);

    const handleSignin = (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        setIsLoading(true);
        singInUser(email, password)
            .then(() => {
                toast.success('Successfully signed in! Redirecting...');
                // Don't redirect here - let useEffect handle it when user state updates
            })
            .catch((error) => {
                setIsLoading(false);
                console.error('[v0] Signin error code:', error.code);
                console.error('[v0] Signin error message:', error.message);
                
                // Handle Firebase-specific error codes
                const errorMap = {
                    'auth/invalid-email': 'Please enter a valid email address.',
                    'auth/user-disabled': 'This account has been disabled.',
                    'auth/user-not-found': 'No account found with this email.',
                    'auth/wrong-password': 'Incorrect password. Please try again.',
                    'auth/invalid-login-credentials': 'Invalid email or password.',
                    'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
                    'auth/operation-not-allowed': 'Email/password sign-in is not enabled.',
                };
                
                const userFriendlyMessage = errorMap[error.code] || error.message || "Sign in failed. Please try again.";
                toast.error(userFriendlyMessage);
            });
    };

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        signInWithGoogle()
            .then(() => {
                toast.success('Successfully signed in with Google! Redirecting...');
                // Don't redirect here - let useEffect handle it when user state updates
            })
            .catch((error) => {
                setIsLoading(false);
                console.error('[v0] Google Sign-In error code:', error.code);
                console.error('[v0] Google Sign-In error:', error.message);
                
                // Use the user-friendly message from the provider if available
                const errorMessage = error.userFriendlyMessage || error.message || "Cannot sign in with Google. Try email/password.";
                toast.error(errorMessage);
            });
    };

    return (
        <div className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 gap-8">
             <Helmet>
                <title>{`Sign In - ${schoolConfig.name} Lost & Found`}</title>
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
                <p className="text-center text-gray-500 text-xs mb-5">Welcome back</p>
                
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FcGoogle size={20} />
                    Continue with Google
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
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent transition duration-200"
                        required
                    />
                    
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent transition duration-200"
                            required
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
                        <a href="#" className="text-xs text-zetech-primary hover:underline">
                            Forgot password?
                        </a>
                    </div>
                    
                    <button 
                        disabled={isLoading}
                        className="w-full bg-zetech-primary text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-zetech-accent transition duration-300 text-sm mt-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="text-center mt-4 text-gray-600 text-xs">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-zetech-primary hover:underline font-semibold">
                        Register
                    </Link>
                </div>
                
                <div className="text-center mt-2 text-gray-500 text-xs">
                    Security staff?{' '}
                    <Link to="/admin-login" className="text-orange-600 hover:underline font-semibold">
                        Admin Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signin;
