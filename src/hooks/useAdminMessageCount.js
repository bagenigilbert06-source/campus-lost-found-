import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/Authcontext/AuthContext';
import { messagesService } from '../services/apiService';

/**
 * Custom hook to get real-time message count (received from students only - admin view)
 * Polls for updates every 30 seconds
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
      
      // Fetch all messages
      const response = await messagesService.getMessages();
      
      // Filter: Only count messages received from students
      const allMessages = response.data || [];
      const receivedFromStudentCount = allMessages.filter((msg) => {
        return (
          msg.recipientEmail === user.email &&
          msg.senderRole === "student"
        );
      }).length;
      
      setMessageCount(receivedFromStudentCount);
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
      // Fetch immediately when component mounts
      fetchMessageCount();

      // Poll for updates every 30 seconds
      const interval = setInterval(fetchMessageCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchMessageCount]);

  return {
    messageCount,
    loading,
    error,
    refetch: fetchMessageCount,
  };
};

export default useAdminMessageCount;
