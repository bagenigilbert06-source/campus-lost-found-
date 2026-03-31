import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import auth from '../firebase/firebase.init';
import AuthContext from '../context/Authcontext/AuthContext';

/**
 * Custom hook to batch-check bookmark status for multiple items
 * Replaces N individual requests with a single batch request
 * Usage:
 *   const bookmarkStatus = useBatchBookmarks([itemId1, itemId2, ...]);
 *   const isBookmarked = bookmarkStatus[itemId];
 */
export const useBatchBookmarks = (itemIds = []) => {
  const { user } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookmarks = useCallback(async () => {
    if (!itemIds || itemIds.length === 0 || !user) {
      setBookmarks({});
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getIdToken(auth.currentUser);
      if (!token) return;

      const response = await axios.post(
        'http://localhost:3001/api/bookmarks/check-batch',
        { itemIds },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setBookmarks(response.data.bookmarks || {});
    } catch (err) {
      console.error('[useBatchBookmarks] Error fetching bookmarks:', err);
      setError(err.message);
      // On error, assume nothing is bookmarked to avoid false positives
      setBookmarks({});
    } finally {
      setLoading(false);
    }
  }, [itemIds, user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return { bookmarks, loading, error, refetch: fetchBookmarks };
};
