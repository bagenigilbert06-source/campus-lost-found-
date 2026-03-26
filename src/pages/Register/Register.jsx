import React, { useContext, useState } from 'react';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import registerAnimation from '../../assets/signup.json';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

/**
 * Student Registration Page
 * - Creates student accounts (role=student)
 * - Initializes student-specific profile defaults
 * - Admins are designated by email in schoolConfig.adminEmails
 */
const Register = () => {
  const { registerWithEmail, signInWithGoogle, USER_ROLES } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const photo = e.target.photo.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=ffffff`;

    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Password validation
    const isValidPassword =
      password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password);

    if (!isValidPassword) {
      toast.error('Password must be at least 6 characters long, with at least one uppercase and one lowercase letter');
      return;
    }

    setIsLoading(true);

    try {
      // Create user using local auth - saves to MongoDB with hashed password
      const { role } = await registerWithEmail(email, password, name, photo);
      
      toast.success('Account created successfully!');
      
      // Role-based redirect
      if (role === USER_ROLES.ADMIN) {
        toast('Admin account detected - redirecting to admin dashboard', { icon: 'info' });
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || "Cannot sign up, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const { role } = await signInWithGoogle();
      
      toast.success('Account created with Google!');
      
      // Role-based redirect
      if (role === USER_ROLES.ADMIN) {
        toast('Admin account detected - redirecting to admin dashboard', { icon: 'info' });
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Google Sign-Up error:', error);
      
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked. Please allow popups and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-up cancelled.');
      } else if (error.code === 'auth/configuration-not-found') {
        toast.error('Google Sign-Up not available. Try email/password instead.');
      } else {
        toast.error(error.userFriendlyMessage || error.message || "Cannot sign up with Google. Try email/password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 gap-8">
      <Helmet>
        <title>Register - {schoolConfig.name} Lost & Found</title>
      </Helmet>

      {/* Form Section */}
      <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-1 text-gray-900">
          Create Account
        </h1>
        <p className="text-center text-gray-500 text-xs mb-5">Join {schoolConfig.shortName} Lost & Found</p>
        
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={20} />
          {isLoading ? 'Creating account...' : 'Continue with Google'}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">Or email</span>
          </div>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (6+ chars, upper & lower)"
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
          <div>
            <input
              type="text"
              name="photo"
              placeholder="Photo URL (optional)"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-teal-700 transition duration-300 text-sm mt-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        <div className="text-center mt-4 text-gray-600 text-xs">
          Already have an account?{' '}
          <Link to="/signin" className="text-teal-600 hover:underline font-semibold">
            Sign in
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-2">Are you security staff?</p>
          <Link 
            to="/admin-login" 
            className="text-xs text-orange-600 hover:underline font-semibold"
          >
            Admin / Security Staff Login
          </Link>
        </div>
      </div>

      {/* Animation Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <Lottie animationData={registerAnimation} className="w-full max-w-md" />
      </div>
    </div>
  );
};

export default Register;
