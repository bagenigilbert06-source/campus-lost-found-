import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const useAdminUsers = (page = 1, sortBy = '-createdAt') => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users with pagination
      const usersResponse = await adminService.getUsersWithPagination(
        page,
        20,
        sortBy
      );
      console.log('[v0] Users response:', usersResponse);

      setUsers(usersResponse.data || []);
      setTotal(usersResponse.pagination?.total || 0);

      // Fetch analytics stats
      try {
        const analyticsResponse = await adminService.getItemAnalytics();
        setStats(analyticsResponse.data || {});
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    } catch (err) {
      console.error('[v0] Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy]);

  return {
    users,
    total,
    stats,
    loading,
    error,
    refetch: fetchUsers,
  };
};

export default useAdminUsers;
