import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiService';

export const useAdminData = (endpoint, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchData = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(endpoint, {
          params: { ...initialParams, ...params },
        });

        setData(response.data.data || response.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (err) {
        console.error(`[v0] Error fetching from ${endpoint}:`, err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, initialParams]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToPage = useCallback(
    (page) => {
      fetchData({ page });
    },
    [fetchData]
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    goToPage,
    refetch,
  };
};

export default useAdminData;
