import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, itemsData, usersData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRecentItems(5),
        adminService.getRecentUsers(5),
      ]);

      setStats(statsData.data || statsData);
      setRecentItems(itemsData.data || []);
      setRecentUsers(usersData.data || []);
    } catch (err) {
      console.error('[v0] Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    recentItems,
    recentUsers,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};

export default useAdminDashboard;
