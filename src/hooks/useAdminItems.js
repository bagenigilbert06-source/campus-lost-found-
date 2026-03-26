import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const useAdminItems = (page = 1, status = 'all', category = 'all') => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 20,
      };

      if (status !== 'all') {
        params.status = status;
      }

      if (category !== 'all') {
        params.category = category;
      }

      const response = await adminService.getItems(params);
      console.log('[v0] Items response:', response);

      setItems(response.data || []);
      setTotal(response.pagination?.total || 0);

      // Fetch categories if not already loaded
      if (categories.length === 0) {
        try {
          const categoriesResponse = await adminService.getCategories();
          setCategories(categoriesResponse || []);
        } catch (err) {
          console.error('Error fetching categories:', err);
        }
      }
    } catch (err) {
      console.error('[v0] Failed to fetch items:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, status, category]);

  return {
    items,
    total,
    loading,
    error,
    categories,
    refetch: fetchItems,
  };
};

export default useAdminItems;
