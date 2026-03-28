import axios from 'axios';

// Configure API base URL - update this when deploying
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Authentication Service
 */
export const authService = {
  verifyToken: async (token: string) => {
    const response = await apiClient.post('/auth/verify', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.user;
  },

  updateNotifications: async (preferences: any) => {
    const response = await apiClient.put('/auth/notifications', preferences);
    return response.data.preferences;
  },
};

/**
 * Items Service
 */
export const itemsService = {
  getAllItems: async (filters?: any, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get('/items', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  getItemById: async (itemId: string) => {
    const response = await apiClient.get(`/items/${itemId}`);
    return response.data.data;
  },

  getUserItems: async (userId: string) => {
    const response = await apiClient.get(`/items/user/${userId}`);
    return response.data.data;
  },

  createItem: async (itemData: any) => {
    const response = await apiClient.post('/items', itemData);
    return response.data.data;
  },

  updateItem: async (itemId: string, updates: any) => {
    const response = await apiClient.put(`/items/${itemId}`, updates);
    return response.data.data;
  },

  deleteItem: async (itemId: string) => {
    await apiClient.delete(`/items/${itemId}`);
  },

  claimItem: async (itemId: string) => {
    const response = await apiClient.post(`/items/${itemId}/claim`);
    return response.data.data;
  },

  claimItemWithNotification: async (itemId: string) => {
    const response = await apiClient.post(`/items/${itemId}/claim-with-notification`);
    return response.data.data;
  },

  getItemMatches: async (itemId: string) => {
    const response = await apiClient.get(`/items/${itemId}/matches`);
    return response.data.data;
  },
};

/**
 * Search Service
 */
export const searchService = {
  search: async (filters?: any, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get('/search', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  searchNearby: async (lat: number, lng: number, radius?: number) => {
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
  getMatches: async (itemId: string) => {
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
  getPreferences: async () => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data.preferences;
  },

  updatePreferences: async (preferences: any) => {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response.data.preferences;
  },

  sendTestNotification: async () => {
    const response = await apiClient.post('/notifications/send-test');
    return response.data;
  },

  getNotificationHistory: async (limit: number = 20) => {
    const response = await apiClient.get('/notifications/history', {
      params: { limit },
    });
    return response.data.data;
  },
};

export default {
  authService,
  itemsService,
  searchService,
  matchingService,
  notificationService,
};
