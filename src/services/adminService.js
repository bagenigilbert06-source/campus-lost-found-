import apiClient from './apiService';

const adminService = {
  // ============ DASHBOARD STATS ============
  getAdminStats: async () => {
    try {
      const response = await apiClient.get('/items/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // ============ ITEMS MANAGEMENT ============
  getItems: async (params = {}) => {
    try {
      const response = await apiClient.get('/items', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  getItemsByStatus: async (status, page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/items', {
        params: { status, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items by status:', error);
      throw error;
    }
  },

  getPendingItems: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/items', {
        params: {
          status: 'pending',
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending items:', error);
      throw error;
    }
  },

  getRecentItems: async (limit = 10) => {
    try {
      const response = await apiClient.get('/items', {
        params: {
          sortBy: '-createdAt',
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent items:', error);
      throw error;
    }
  },

  getItemsByCategory: async (category, page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/items', {
        params: { category, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items by category:', error);
      throw error;
    }
  },

  verifyItem: async (itemId) => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        verificationStatus: 'verified',
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying item:', error);
      throw error;
    }
  },

  rejectItem: async (itemId, reason = '') => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        verificationStatus: 'rejected',
        rejectionReason: reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting item:', error);
      throw error;
    }
  },

  deleteItem: async (itemId) => {
    try {
      const response = await apiClient.delete(`/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  markAsRecovered: async (itemId) => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        status: 'recovered',
      });
      return response.data;
    } catch (error) {
      console.error('Error marking item as recovered:', error);
      throw error;
    }
  },

  markAsClaimed: async (itemId) => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        status: 'claim_in_progress',
      });
      return response.data;
    } catch (error) {
      console.error('Error marking item as claimed:', error);
      throw error;
    }
  },

  // ============ USERS MANAGEMENT ============
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUsersWithPagination: async (page = 1, limit = 20, sortBy = '-createdAt') => {
    try {
      const response = await apiClient.get('/users', {
        params: { page, limit, sortBy },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getRecentUsers: async (limit = 10) => {
    try {
      const response = await apiClient.get('/users', {
        params: {
          sortBy: '-createdAt',
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent users:', error);
      throw error;
    }
  },

  getUserStats: async (userId) => {
    try {
      const response = await apiClient.get(`/items/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // ============ ANALYTICS ============
  getItemAnalytics: async () => {
    try {
      const response = await apiClient.get('/items/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // ============ CATEGORIES ============
  getCategories: async () => {
    try {
      const response = await apiClient.get('/search/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // ============ LOCATIONS ============
  getLocations: async () => {
    try {
      const response = await apiClient.get('/search/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },
};

export default adminService;
