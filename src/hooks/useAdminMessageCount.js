import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { messagesService } from '../services/apiService';

/**
 * Custom hook to get real-time message count (received from students - admin view).
 * Now uses backend count filtering instead of fetching all messages.
 * No polling - only fetches on mount or when user changes.
 */
export const useAdminMessageCount = () => {
  const { user } = useContext(AuthContext);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessageCount = useCallback(async () => {
    if (!user) {
      setMessageCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch ONLY messages received by this admin user from students
      // Backend will handle filtering and counting
      const response = await messagesService.getMessages({
        recipientEmail: user.email,
        senderRole: 'student',
        limit: 1, // We only need count, fetch minimal data
      });
      
      const count = response.total || 0;
      setMessageCount(count);
    } catch (err) {
      console.error('[useAdminMessageCount] Error fetching message count:', err);
      setError(err.message || 'Failed to fetch message count');
      // Keep the previous count on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Fetch immediately when component mounts or user changes
      fetchMessageCount();
      // No polling - removed the 30s interval
    }
  }, [user, fetchMessageCount]);

  return {
    messageCount,
    loading,
    error,
    refetch: fetchMessageCount, // Exported for manual refetch after actions
  };
};

export default useAdminMessageCount;
