import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import auth from '../firebase/firebase.init';

// Configure API base URL - update this when deploying
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Interceptor to add Firebase ID token
apiClient.interceptors.request.use(async (config) => {
  try {
    // Try to get Firebase ID token if user is logged in
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    // User not logged in, continue without token
    console.debug('[API] Firebase token not available, continuing without auth');
  }
  return config;
});

// Error interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, could trigger re-authentication here
      console.warn('[API] Unauthorized response received');
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 */
export const authService = {
  verifyToken: async (token) => {
    const response = await apiClient.post('/auth/verify', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.user;
  },

  updateNotifications: async (preferences) => {
    const response = await apiClient.put('/auth/notifications', preferences);
    return response.data.preferences;
  },
};

/**
 * Items Service
 */
export const itemsService = {
  getAllItems: async (filters, page = 1, limit = 10) => {
    const response = await apiClient.get('/items', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  getItemById: async (itemId) => {
    const response = await apiClient.get(`/items/${itemId}`);
    return response.data.data;
  },

  getUserItems: async (userId) => {
    const response = await apiClient.get(`/items/user/${userId}`);
    return response.data.data;
  },

  createItem: async (itemData) => {
    const response = await apiClient.post('/items', itemData);
    return response.data.data;
  },

  updateItem: async (itemId, updates) => {
    const response = await apiClient.put(`/items/${itemId}`, updates);
    return response.data.data;
  },

  deleteItem: async (itemId) => {
    await apiClient.delete(`/items/${itemId}`);
  },

  claimItem: async (itemId) => {
    const response = await apiClient.post(`/items/${itemId}/claim`);
    return response.data.data;
  },

  claimItemWithNotification: async (itemId) => {
    const response = await apiClient.post(`/items/${itemId}/claim-with-notification`);
    return response.data.data;
  },

  getItemMatches: async (itemId) => {
    const response = await apiClient.get(`/items/${itemId}/matches`);
    return response.data.data;
  },
};

/**
 * Search Service
 */
export const searchService = {
  search: async (filters, page = 1, limit = 10) => {
    const response = await apiClient.get('/search', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  searchNearby: async (lat, lng, radius) => {
    const response = await apiClient.get('/search/nearby', {
      params: { lat, lng, radius },
    });
    return response.data.data;
  },

  getTrendingItems: async () => {
    const response = await apiClient.get('/search/trending');
    return response.data.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/search/categories');
    return response.data.data;
  },

  getLocations: async () => {
    const response = await apiClient.get('/search/locations');
    return response.data.data;
  },
};

/**
 * Matching Service
 */
export const matchingService = {
  getMatches: async (itemId) => {
    const response = await apiClient.get(`/matches/item/${itemId}`);
    return response.data.data;
  },

  getUserMatches: async () => {
    const response = await apiClient.get('/matches/user');
    return response.data.data;
  },
};

/**
 * Notification Service
 */
export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching notifications:', error);
      // Return empty notifications on error
      return { success: false, notifications: [], unreadCount: 0, error: error.message };
    }
  },

  getPreferences: async () => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data.preferences;
  },

  updatePreferences: async (preferences) => {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data.preferences;
  },

  sendTestNotification: async () => {
    const response = await apiClient.post('/notifications/send-test');
    return response.data;
  },

  getNotificationHistory: async (limit = 20) => {
    const response = await apiClient.get('/notifications/history', {
      params: { limit },
    });
    return response.data.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`, {});
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read', {});
    return response.data;
  },
};

/**
 * Claims Service
 */
export const claimsService = {
  getClaims: async (email) => {
    try {
      const params = email ? { studentEmail: email } : {};
      const response = await apiClient.get('/claims', { params });
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching claims:', error);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  getClaimById: async (claimId) => {
    const response = await apiClient.get(`/claims/${claimId}`);
    return response.data.data;
  },

  updateClaimStatus: async (claimId, status) => {
    const response = await apiClient.patch(`/claims/${claimId}/status`, { status });
    return response.data;
  },
};

export default {
  authService,
  itemsService,
  searchService,
  matchingService,
  notificationService,
  claimsService,
};
