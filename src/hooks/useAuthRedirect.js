/**
 * useAuthRedirect Hook
 * Handles post-login redirect logic consistently across auth pages
 * 
 * Features:
 * - Prevents auth state flicker
 * - Respects intended path if user has permission
 * - Falls back to role-based dashboard
 * - Cleans up intended path after use
 * - Works with both popup and redirect auth flows
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getIntendedPath, 
  clearIntendedPath, 
  getFinalRedirectPath 
} from '../utils/authRedirectManager';
import { schoolConfig } from '../config/schoolConfig';

/**
 * Hook to handle auth redirect after login
 * 
 * Usage:
 * const { shouldRedirect } = useAuthRedirect(user, loading);
 * 
 * @param {Object} user - Firebase user object
 * @param {boolean} loading - Auth loading state
 * @param {string} userRole - User role ('admin' or 'student')
 * @returns {Object} - { shouldRedirect: boolean, finalPath: string }
 */
export const useAuthRedirect = (user, loading, userRole) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only process when auth state is fully settled
    if (loading) return;

    // User has been authenticated
    if (user && user.email) {
      const finalPath = getFinalRedirectPath(user, userRole, schoolConfig.adminEmails);
      
      // Clear intended path so it doesn't persist
      clearIntendedPath();
      
      // Navigate to final destination
      navigate(finalPath, { replace: true });
    }
  }, [user, loading, userRole, navigate]);

  return {
    shouldRedirect: !loading && !!user,
    finalPath: user ? getFinalRedirectPath(user, userRole, schoolConfig.adminEmails) : null,
  };
};

export default useAuthRedirect;
