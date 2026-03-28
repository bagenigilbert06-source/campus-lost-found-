/**
 * MongoDB GridFS Image Utilities
 * Handles image uploads to MongoDB via backend API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Upload a profile photo to MongoDB GridFS via backend
 * 
 * @param {File} file - The image file to upload
 * @param {string} firebaseUid - Firebase UID of the user (for backend reference)
 * @returns {Promise<string>} - Download URL of the uploaded image
 */
export const uploadProfilePhoto = async (file, firebaseUid) => {
  if (!file) {
    return null;
  }

  try {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be less than 5MB');
    }

    // Create FormData and append file
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading profile photo to MongoDB GridFS via backend...');
    
    // Get auth token from localStorage
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Upload file via backend API
    const response = await fetch(`${API_BASE}/images/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload photo';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
        
        // Provide specific error messages for common issues
        if (response.status === 503) {
          errorMessage = 'Image service is temporarily unavailable. Please try again in a moment.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 5MB.';
        }
      } catch (parseError) {
        // If response is not JSON, use status-based message
        if (response.status === 503) {
          errorMessage = 'Image service is temporarily unavailable. Please try again in a moment.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 5MB.';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Photo uploaded successfully');
    console.log('Download URL obtained:', data.url);

    // Return the full download URL
    return `${API_BASE}${data.url}`;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

/**
 * Upload an item photo to MongoDB GridFS via backend
 * 
 * @param {File} file - The image file to upload
 * @param {string} firebaseUid - Firebase UID of the user
 * @returns {Promise<string>} - Download URL of the uploaded image
 */
export const uploadItemPhoto = async (file, firebaseUid) => {
  if (!file) {
    return null;
  }

  try {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 10MB for items)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image must be less than 10MB');
    }

    // Create FormData and append file
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading item photo to MongoDB GridFS via backend...');
    
    // Get auth token from localStorage
    const token = localStorage.getItem('firebaseToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Upload file via backend API
    const response = await fetch(`${API_BASE}/images/item`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload photo';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
        
        // Provide specific error messages for common issues
        if (response.status === 503) {
          errorMessage = 'Image service is temporarily unavailable. Please try again in a moment.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 10MB.';
        }
      } catch (parseError) {
        // If response is not JSON, use status-based message
        if (response.status === 503) {
          errorMessage = 'Image service is temporarily unavailable. Please try again in a moment.';
        } else if (response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 10MB.';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Photo uploaded successfully');
    console.log('Download URL obtained:', data.url);

    // Return the full download URL
    return `${API_BASE}${data.url}`;
  } catch (error) {
    console.error('Error uploading item photo:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

/**
 * Delete a photo from Firebase Storage
 * 
 * @param {string} fileURL - The download URL of the file
 * @returns {Promise<void>}
 */
export const deleteProfilePhoto = async (fileURL) => {
  if (!fileURL) return;

  try {
    // Firebase Storage deletion via download URL is not directly supported
    // To implement this, you would need to store the file path in the database
    console.log('Note: Use file path reference for deletion instead of URL');
  } catch (error) {
    console.error('Error deleting photo:', error);
  }
};
