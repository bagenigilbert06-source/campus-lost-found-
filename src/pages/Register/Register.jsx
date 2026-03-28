import React, { useContext, useState } from 'react';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import registerAnimation from '../../assets/signup.json';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import useAuthRedirect from '../../hooks/useAuthRedirect';

const Register = () => {
  const { createUser, signInWithGoogle, user, loading, userRole } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Handle redirect after successful authentication
  useAuthRedirect(user, loading, userRole);

  // Handle photo file selection
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setPhotoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const isValidPassword =
      password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password);

    if (!isValidPassword) {
      toast.error('Password must be at least 6 characters long, with at least one uppercase and one lowercase letter');
      return;
    }

    setIsLoading(true);
    try {
      // Pass photo file to createUser function
      // It will handle upload after user creation with proper Firebase UID
      await createUser(email, password, name, photoFile);
      
      toast.success('Successfully registered! Redirecting...');
      // Reset photo after successful registration
      setPhotoFile(null);
      setPhotoPreview(null);
      // Don't redirect here - useAuthRedirect hook handles it when user state updates
    } catch (error) {
      setIsLoading(false);
      console.error('[Register] Error:', error);
      
      // Handle Firebase-specific error codes
      const errorMap = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters with uppercase and lowercase letters.',
        'auth/operation-not-allowed': 'Email/password registration is not enabled. Please try Google Sign-up.',
        'auth/too-many-requests': 'Too many registration attempts. Please try again later.',
      };
      
      // Check if error is from storage upload
      if (error.message && error.message.includes('Failed to upload photo')) {
        toast.error(error.message);
        return;
      }
      
      const userFriendlyMessage = errorMap[error.code] || error.message || "Registration failed. Please try again.";
      toast.error(userFriendlyMessage);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signInWithGoogle()
      .catch((error) => {
        setIsLoading(false);
        console.error('[Google Sign-Up] Error code:', error.code);
        console.error('[Google Sign-Up] Error message:', error.message);
        
        // Use user-friendly error message
        const errorMessage = error.userFriendlyMessage || error.message || "Cannot sign up with Google. Try email/password.";
        toast.error(errorMessage);
      });
    // Note: On success, the useAuthRedirect hook will handle navigation.
    // If redirect flow is used, user will be redirected to Google then back to app.
  };

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 gap-8">
      <Helmet>
        <title>{`Register - ${schoolConfig.name} Lost & Found`}</title>
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
        
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent transition duration-200"
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent transition duration-200"
              required
            />
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (6+ chars)"
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
          <div>
            <label htmlFor="photo" className="block text-sm font-bold text-gray-800 mb-2">
              Profile Photo (Optional)
            </label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent transition duration-200 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB (JPG, PNG, GIF)</p>
              </div>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border border-emerald-200"
                />
              )}
            </div>
          </div>
          
          <button 
            disabled={isLoading}
            className="w-full bg-zetech-primary text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-zetech-accent transition duration-300 text-sm mt-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        <div className="text-center mt-4 text-gray-600 text-xs">
          Already have an account?{' '}
          <Link to="/signin" className="text-zetech-primary hover:underline font-semibold">
            Sign in
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
