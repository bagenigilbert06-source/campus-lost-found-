import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaBookmark as FaBookmarkSolid } from 'react-icons/fa';
import { FaRegBookmark } from 'react-icons/fa';
import AuthContext from '../context/Authcontext/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

const BookmarkButton = ({ itemId, size = 'md', showLabel = false }) => {
  const { user } = useContext(AuthContext);
  const [isBookmarked, setIsBookmarked] = useState(false);
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

  useEffect(() => {
    if (user && itemId) {
      checkBookmarkStatus();
    }
  }, [user, itemId]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/bookmarks/check/${itemId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
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
      if (isBookmarked) {
        await axios.delete(
          `http://localhost:3001/api/bookmarks/${itemId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:3001/api/bookmarks`,
          { itemId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      setIsBookmarked(!isBookmarked);
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
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <FaBookmarkSolid className={sizeClasses[size]} />
      ) : (
        <FaRegBookmark className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </motion.button>
  );
};

export default BookmarkButton;
