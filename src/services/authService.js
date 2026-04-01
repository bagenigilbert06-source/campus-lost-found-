import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import auth from '../firebase/firebase.init';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

const authService = {
  /**
   * Register a new user with email and password
   * Creates Firebase user and backend profile
   */
  registerUser: async (email, password, displayName, photoURL = '') => {
    try {
      // The Firebase user creation is handled in AuthProvider
      // This function sends the user data to the backend
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated with Firebase');
      }

      // Get Firebase ID token
      const token = await getIdToken(currentUser);

      // Send registration data to backend
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        displayName,
        photoURL,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Store token for future requests
      localStorage.setItem('firebaseToken', token);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Login user and get backend profile
   */
  loginUser: async (email, password) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const token = await getIdToken(currentUser);
      
      // Store token for future requests
      localStorage.setItem('firebaseToken', token);
      
      // Get user profile from backend
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Get current user profile from backend
   */
  getCurrentUserProfile: async () => {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (preferences) => {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`${API_URL}/auth/notifications`, preferences, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.preferences;
    } catch (error) {
      console.error('Update notifications error:', error);
      throw error;
    }
  },

  /**
   * Logout user and clear token
   */
  logoutUser: () => {
    localStorage.removeItem('firebaseToken');
  },

  /**
   * Get Firebase ID token
   */
  getToken: async () => {
    try {
      if (!auth.currentUser) {
        return null;
      }
      const token = await getIdToken(auth.currentUser);
      localStorage.setItem('firebaseToken', token);
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },
};

export default authService;
