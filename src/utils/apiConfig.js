/**
 * Centralized API configuration for production-safe URL handling
 */

// Get the API base URL from environment variables
export const getApiBaseUrl = () => {
  // Production: Use full backend URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Local development: Use relative API path (proxied by Vite)
  return '/api';
};

// Legacy alias for backward compatibility
export const API_BASE = getApiBaseUrl();

// Get the backend base URL (without /api) for constructing asset URLs
export const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    // Remove /api suffix if present to get base URL
    return apiUrl.replace(/\/api\/?$/, '');
  }

  // Local development: Use relative path
  return '';
};

// Construct full API endpoint URLs
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Construct backend asset URLs (for images, files, etc.)
export const getAssetUrl = (assetPath) => {
  const backendUrl = getBackendBaseUrl();
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${backendUrl}${cleanPath}`;
};

// Environment detection
export const isProduction = () => {
  return import.meta.env.PROD === true;
};

export const isDevelopment = () => {
  return import.meta.env.DEV === true;
};