/**
 * Router exports
 * Centralized exports for all route guards and router
 */

// Main router
export { default as router } from './Router';

// Route guards
export { default as AdminRoute } from './AdminRoute';
export { default as StudentRoute } from './StudentRoute';
export { default as PrivateRoute } from './PrivetRoute';
export { default as PublicRoute } from './PublicRoute';
