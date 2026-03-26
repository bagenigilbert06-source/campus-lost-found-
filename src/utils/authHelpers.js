/**
 * Auth Helper Utilities
 * Centralized helpers for role-based authentication
 */

import { schoolConfig } from '../config/schoolConfig';

// Role constants
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

// Auth status constants
export const AUTH_STATUS = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
};

/**
 * Check if an email belongs to an admin user
 * @param {string} email - User's email address
 * @returns {boolean} - True if email is in admin list
 */
export const isAdminEmail = (email) => {
  if (!email) return false;
  return schoolConfig.adminEmails.includes(email.toLowerCase());
};

/**
 * Determine user role based on email
 * @param {string} email - User's email address
 * @returns {string} - User role (admin or student)
 */
export const determineRole = (email) => {
  if (!email) return null;
  return isAdminEmail(email) ? USER_ROLES.ADMIN : USER_ROLES.STUDENT;
};

/**
 * Get the appropriate dashboard path for a user role
 * @param {string} role - User's role
 * @returns {string} - Dashboard path
 */
export const getDashboardPath = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return '/admin';
  }
  return '/dashboard';
};

/**
 * Get the appropriate login path for a user role
 * @param {string} role - User's role (optional)
 * @returns {string} - Login path
 */
export const getLoginPath = (role) => {
  if (role === USER_ROLES.ADMIN) {
    return '/admin-login';
  }
  return '/signin';
};

/**
 * Check if a path is an admin-only path
 * @param {string} path - URL path
 * @returns {boolean} - True if path is admin-only
 */
export const isAdminPath = (path) => {
  const adminPaths = ['/admin', '/admin-login'];
  return adminPaths.some(adminPath => path.startsWith(adminPath));
};

/**
 * Check if a path is a student-only path
 * @param {string} path - URL path
 * @returns {boolean} - True if path is student-only
 */
export const isStudentPath = (path) => {
  const studentPaths = ['/dashboard'];
  return studentPaths.some(studentPath => path.startsWith(studentPath));
};

/**
 * Check if a path is a public auth page
 * @param {string} path - URL path
 * @returns {boolean} - True if path is a public auth page
 */
export const isAuthPage = (path) => {
  const authPaths = ['/signin', '/register', '/admin-login'];
  return authPaths.includes(path);
};

/**
 * Get redirect path after login based on role and intended destination
 * @param {string} role - User's role
 * @param {string} from - Original intended path
 * @returns {string} - Redirect path
 */
export const getPostLoginRedirect = (role, from) => {
  // If no intended destination or it's an auth page, go to dashboard
  if (!from || isAuthPage(from)) {
    return getDashboardPath(role);
  }
  
  // Admin trying to access student-only pages
  if (role === USER_ROLES.ADMIN && isStudentPath(from)) {
    return '/admin';
  }
  
  // Student trying to access admin-only pages
  if (role === USER_ROLES.STUDENT && isAdminPath(from)) {
    return '/dashboard';
  }
  
  // Otherwise, go to intended destination
  return from;
};

export default {
  USER_ROLES,
  AUTH_STATUS,
  isAdminEmail,
  determineRole,
  getDashboardPath,
  getLoginPath,
  isAdminPath,
  isStudentPath,
  isAuthPage,
  getPostLoginRedirect
};
