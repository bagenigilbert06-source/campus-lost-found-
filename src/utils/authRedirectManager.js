/**
 * Auth Redirect Manager
 * Stores and retrieves intended destination after login
 * Prevents auth flicker and ensures correct post-login redirect
 */

const INTENDED_PATH_KEY = '__auth_intended_path__';
const INTENDED_ROLE_KEY = '__auth_intended_role__';

/**
 * Store the intended destination before redirecting to login
 * This is called by route guards before redirecting to auth pages
 * 
 * @param {string} path - The path user was trying to access
 * @param {string} requiredRole - The role required to access this path (optional)
 */
export const setIntendedPath = (path, requiredRole = null) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(INTENDED_PATH_KEY, path);
      if (requiredRole) {
        sessionStorage.setItem(INTENDED_ROLE_KEY, requiredRole);
      }
    } catch (e) {
      console.warn('Could not store intended path:', e);
    }
  }
};

/**
 * Get the stored intended destination
 * Call this after successful login to redirect user to original page
 * 
 * @returns {string} - The intended path, or null if none stored
 */
export const getIntendedPath = () => {
  if (typeof window !== 'undefined') {
    try {
      return sessionStorage.getItem(INTENDED_PATH_KEY);
    } catch (e) {
      console.warn('Could not retrieve intended path:', e);
    }
  }
  return null;
};

/**
 * Get the required role for the intended path
 * 
 * @returns {string|null} - The required role, or null if none
 */
export const getIntendedRole = () => {
  if (typeof window !== 'undefined') {
    try {
      return sessionStorage.getItem(INTENDED_ROLE_KEY);
    } catch (e) {
      console.warn('Could not retrieve intended role:', e);
    }
  }
  return null;
};

/**
 * Clear the stored intended destination
 * Call this when redirecting user after successful auth
 */
export const clearIntendedPath = () => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(INTENDED_PATH_KEY);
      sessionStorage.removeItem(INTENDED_ROLE_KEY);
    } catch (e) {
      console.warn('Could not clear intended path:', e);
    }
  }
};

/**
 * Get the final redirect destination based on user state
 * 
 * @param {Object} user - Firebase user object
 * @param {string} userRole - User role ('admin' or 'student')
 * @param {Array<string>} adminEmails - List of admin email addresses
 * @returns {string} - The path to redirect to
 */
export const getFinalRedirectPath = (user, userRole, adminEmails = []) => {
  // Check if user has intended path and has correct role
  const intendedPath = getIntendedPath();
  const intendedRole = getIntendedRole();

  if (intendedPath && (!intendedRole || userRole === intendedRole)) {
    // User is trying to access their intended path and has required role
    return intendedPath;
  }

  // Default redirects based on role
  if (userRole === 'admin' || adminEmails.includes(user?.email?.toLowerCase())) {
    return '/admin';
  }

  return '/app/dashboard';
};

/**
 * Check if user has permission to access intended path
 * 
 * @param {string} userRole - User role
 * @returns {boolean} - True if user can access, false otherwise
 */
export const canAccessIntendedPath = (userRole) => {
  const intendedRole = getIntendedRole();

  // No role requirement
  if (!intendedRole) {
    return true;
  }

  // User has the required role
  if (userRole === intendedRole) {
    return true;
  }

  return false;
};
