import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaBookmark as FaBookmarkSolid } from 'react-icons/fa';
import { FaRegBookmark } from 'react-icons/fa';
import AuthContext from '../context/Authcontext/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getIdToken } from 'firebase/auth';
import auth from '../firebase/firebase.init';

/**
 * BookmarkButton Component
 * 
 * NOW: Accepts isBookmarked as a prop instead of checking it individually
 * BEFORE: Made 1 request per item card to check bookmark status (N+1 problem)
 * 
 * Usage:
 *   const { bookmarks } = useBatchBookmarks(itemIds);
 *   <BookmarkButton itemId={id} isBookmarked={bookmarks[id]} onStatusChange={refetch} />
 */
const BookmarkButton = ({ 
  itemId, 
  size = 'md', 
  showLabel = false,
  isBookmarked = false,
  onStatusChange = null
}) => {
  const { user } = useContext(AuthContext);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  // Get the Firebase ID token
  const getFirebaseToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await getIdToken(currentUser);
        return token;
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }
    return null;
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Please sign in',
        text: 'You need to be signed in to bookmark items',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      if (bookmarked) {
        await axios.delete(
          `http://localhost:3001/api/bookmarks/${itemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:3001/api/bookmarks`,
          { itemId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const newStatus = !bookmarked;
      setBookmarked(newStatus);
      
      // Notify parent if callback provided
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update bookmark',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      className="flex items-center gap-2 p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors duration-300 disabled:opacity-50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {bookmarked ? (
        <FaBookmarkSolid className={sizeClasses[size]} />
      ) : (
        <FaRegBookmark className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </motion.button>
  );
};

export default BookmarkButton;
