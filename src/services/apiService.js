import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import auth from '../firebase/firebase.init';
import { getApiBaseUrl } from '../utils/apiConfig.js';

// Configure API base URL for production and local dev
export const API_BASE = getApiBaseUrl();

const getAuthToken = async () => {
  try {
    if (auth?.currentUser) {
      return await getIdToken(auth.currentUser, false);
    }
    return localStorage.getItem('firebaseToken');
  } catch (error) {
    return null;
  }
};

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Global default interceptor for all axios usage
axios.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to add Firebase ID token
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // User not logged in or token fetch failed, continue without token
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

  getRecoveredItems: async (email) => {
    const response = await apiClient.get('/items/recovered', {
      params: { email },
    });
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

  updateClaimStatus: async (claimId, status, adminNote = '') => {
    const response = await apiClient.patch(`/claims/${claimId}/status`, { status, adminNote });
    return response.data;
  },
};

export const bookmarksService = {
  addBookmark: async (itemId) => {
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      throw new Error('Invalid itemId provided for bookmark');
    }

    const response = await apiClient.post('/bookmarks', { itemId: itemId.trim() });
    return response.data;
  },

  removeBookmark: async (itemId) => {
    const response = await apiClient.delete(`/bookmarks/${itemId}`);
    return response.data;
  },

  checkBatchBookmarks: async (itemIds) => {
    const response = await apiClient.post('/bookmarks/check-batch', { itemIds });
    return response.data;
  },
};

export const messagesService = {
  getMessages: async (params = {}) => {
    const response = await apiClient.get('/messages', { params });
    return response.data;
  },

  getMessageById: async (id) => {
    const response = await apiClient.get(`/messages/${id}`);
    return response.data.data;
  },

  sendMessage: async (payload) => {
    const response = await apiClient.post('/messages', payload);
    return response.data;
  },

  sendContactMessage: async (payload) => {
    const response = await apiClient.post('/messages/contact', payload);
    return response.data;
  },

  replyToMessage: async (originalMessageId, content) => {
    const response = await apiClient.post('/messages/reply', { originalMessageId, content });
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await apiClient.patch(`/messages/${messageId}`, { isRead: true });
    return response.data;
  },

  deleteMessage: async (messageId, forEveryone = false) => {
    const response = await apiClient.delete(`/messages/${messageId}${forEveryone ? '?forEveryone=true' : ''}`);
    return response.data;
  },

  deleteMessageForEveryone: async (messageId) => {
    const response = await apiClient.delete(`/messages/${messageId}?forEveryone=true`);
    return response.data;
  },

  deleteConversation: async (conversationId, forEveryone = false) => {
    const encodedId = encodeURIComponent(conversationId);
    const response = await apiClient.delete(`/messages/conversation/${encodedId}${forEveryone ? '?forEveryone=true' : ''}`);
    return response.data;
  },

  deleteConversationForEveryone: async (conversationId) => {
    const encodedId = encodeURIComponent(conversationId);
    const response = await apiClient.delete(`/messages/conversation/${encodedId}?forEveryone=true`);
    return response.data;
  },
};

export default {  authService,
  itemsService,
  searchService,
  matchingService,
  notificationService,
  claimsService,
  bookmarksService,
  messagesService,
};
