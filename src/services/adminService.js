import apiClient from './apiService';

const adminService = {
  // Dashboard summary stats
  getAdminStats: async () => {
    try {
      const response = await apiClient.get('/items/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Get all items with filtering, pagination
  getItems: async (params = {}) => {
    try {
      const response = await apiClient.get('/items', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Get pending items for verification
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

  // Get recent items
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

  // Verify an item
  verifyItem: async (itemId) => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        status: 'verified',
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying item:', error);
      throw error;
    }
  },

  // Reject an item
  rejectItem: async (itemId, reason = '') => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        status: 'rejected',
        rejectionReason: reason,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting item:', error);
      throw error;
    }
  },

  // Delete an item
  deleteItem: async (itemId) => {
    try {
      const response = await apiClient.delete(`/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  // Mark item as recovered
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

  // Mark item as claimed
  markAsClaimed: async (itemId) => {
    try {
      const response = await apiClient.patch(`/items/${itemId}`, {
        status: 'claimed',
      });
      return response.data;
    } catch (error) {
      console.error('Error marking item as claimed:', error);
      throw error;
    }
  },

  // Get users
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get recent users
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
};

export default adminService;
