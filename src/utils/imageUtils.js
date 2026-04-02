import { API_BASE } from './apiConfig.js';

/**
 * Image Utility Functions for Lost & Found System
 * Handles image validation, loading, and fallbacks
 */

/**
 * Get the first valid image from an item
 * @param {Object} item - The item object
 * @returns {string|null} - Image URL or null
 */
export const getItemImage = (item) => {
  // Check for images array first (new format)
  if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }
  // Fall back to single image property
  return item?.image || null;
};

/**
 * Get all images from an item
 * @param {Object} item - The item object
 * @returns {Array} - Array of image URLs
 */
export const getItemImages = (item) => {
  // Check for images array first
  if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
    return item.images;
  }
  // Fall back to single image property
  if (item?.image) {
    return [item.image];
  }
  return [];
};

/**
 * Validate if a URL is a valid image
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL appears to be a valid image
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check for common image extensions or data URIs
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || url.startsWith('data:image');
};

/**
 * Normalize image URLs to avoid mixed-content and localhost references
 *
 * - http://localhost should use the API_BASE or current origin
 * - /api paths map to configured backend URL or current origin
 */
export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  console.debug('[normalizeImageUrl] input:', trimmed);

  // Normalize localhost first so we never return local URLs in prod
  if (/^https?:\/\/localhost(:\d+)?/.test(trimmed)) {
    const localPath = trimmed.replace(/^https?:\/\/localhost(:\d+)?/, '');
    const backendUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const backendBase = backendUrl.replace(/\/api\/?$/, '');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const deployedUrl = backendBase || backendUrl || origin || 'https://campus-lost-found-backend-ectt.onrender.com';
    const mapped = `${deployedUrl}${localPath}`;
    console.debug('[normalizeImageUrl] localhost rewritten to deployed:', { trimmed, mapped });
    return mapped;
  }

  // If URL is already absolute or data URL, handle appropriately
  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
    // If page is HTTPS, upgrade HTTP URLs to HTTPS to prevent mixed-content warnings
    const isPageSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    if (isPageSecure && /^http:\/\//i.test(trimmed)) {
      const upgradedUrl = trimmed.replace(/^http:\/\//i, 'https://');
      console.debug('[normalizeImageUrl] upgraded HTTP to HTTPS:', { input: trimmed, output: upgradedUrl });
      return upgradedUrl;
    }
    console.debug('[normalizeImageUrl] absolute/data URL passed through:', trimmed);
    return trimmed;
  }

  const backendUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const backendBase = backendUrl.replace(/\/api\/?$/, ''); // remove trailing /api if present
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const deployedUrl = backendBase || backendUrl || origin || 'https://campus-lost-found-backend-ectt.onrender.com';

  console.debug('[normalizeImageUrl] environment: ', { backendUrl, backendBase, origin, deployedUrl });

  // Redirect local dev host to configured backend host
  if (/^https?:\/\/localhost(:\d+)?/.test(trimmed)) {
    const localPath = trimmed.replace(/^https?:\/\/localhost(:\d+)?/, '');
    const normalized = `${deployedUrl}${localPath}`;
    console.debug('[normalizeImageUrl] changed localhost path to deployed URL:', normalized);
    return normalized;
  }

  // If relative API image path is used, resolve it to proper backend URL/origin
  if (trimmed.startsWith('/api')) {
    const normalized = `${deployedUrl}${trimmed}`;
    console.debug('[normalizeImageUrl] relative /api URL normalized:', normalized);
    return normalized;
  }

  if (trimmed.startsWith('/')) {
    const normalized = `${deployedUrl}${trimmed}`;
    console.debug('[normalizeImageUrl] root-relative URL normalized:', normalized);
    return normalized;
  }

  // Fallback: attempt to treat as relative path from deployed URL
  const fallback = `${deployedUrl}/${trimmed}`;
  console.debug('[normalizeImageUrl] fallback URL:', fallback);
  return fallback;
};

export const resolveImageUrl = (url) => {
  return normalizeImageUrl(url);
};

/**
 * Get image alt text based on item properties
 * @param {Object} item - The item object
 * @returns {string} - Alt text for accessibility
 */
export const getImageAltText = (item) => {
  if (!item) return 'Item image';
  return `${item.title || 'Item'} - ${item.itemType || 'Lost/Found'}`;
};

/**
 * Format image dimensions for display
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - Formatted dimension string
 */
export const formatImageDimensions = (width, height) => {
  if (!width || !height) return 'Size unknown';
  return `${width}x${height}`;
};

/**
 * Get image counter text
 * @param {number} currentIndex - Current image index (0-based)
 * @param {number} total - Total number of images
 * @returns {string} - Counter text
 */
export const getImageCounterText = (currentIndex, total) => {
  return `${currentIndex + 1} / ${total}`;
};

/**
 * Validate image URL batch (for multiple images)
 * @param {Array<string>} urls - Array of image URLs
 * @returns {Object} - Object with valid and invalid URLs
 */
export const validateImageUrls = (urls) => {
  const valid = [];
  const invalid = [];
  
  urls.forEach(url => {
    if (isValidImageUrl(url)) {
      valid.push(url);
    } else {
      invalid.push(url);
    }
  });
  
  return { valid, invalid };
};

/**
 * Handle image load error with callback
 * @param {Event} event - Image load error event
 * @param {Function} fallbackCallback - Callback to handle fallback
 */
export const handleImageError = (event, fallbackCallback) => {
  if (fallbackCallback && typeof fallbackCallback === 'function') {
    fallbackCallback(event);
  } else {
    // Default: hide broken image
    if (event.target) {
      event.target.style.display = 'none';
    }
  }
};

/**
 * Get image dimensions from URL
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

/**
 * Create a data URL from a file (for preview)
 * @param {File} file - File object
 * @returns {Promise<string>} - Data URL
 */
export const createFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default {
  getItemImage,
  getItemImages,
  isValidImageUrl,
  getImageAltText,
  formatImageDimensions,
  getImageCounterText,
  validateImageUrls,
  handleImageError,
  getImageDimensions,
  createFilePreview
};
