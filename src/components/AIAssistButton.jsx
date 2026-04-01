import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMagic, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import auth from '../firebase/firebase.init.js';
import Swal from 'sweetalert2';

const AIAssistButton = ({
  title = '',
  description = '',
  category = '',
  itemType = '',
  onApplySuggestions,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleAIAssist = async () => {
    if (!title.trim() || !description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Fill Required Fields',
        text: 'Please fill in the title and description before requesting AI assistance.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getFirebaseToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const apiHost = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.post(
        `${apiHost}/gemini/improve-item`,
        {
          title,
          description,
          category,
          itemType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.success && response.data.content) {
        try {
          const suggestions = JSON.parse(response.data.content);

          // Show suggestions modal
          const result = await Swal.fire({
            title: '✨ AI Suggestions',
            html: `
              <div class="text-left space-y-4">
                <div>
                  <p class="font-semibold text-emerald-600">Suggested Title:</p>
                  <p class="text-gray-700">"${suggestions.improvedTitle}"</p>
                </div>
                <div>
                  <p class="font-semibold text-emerald-600">Improved Description:</p>
                  <p class="text-gray-700">${suggestions.improvedDescription}</p>
                </div>
                ${suggestions.suggestedCategory ? `
                  <div>
                    <p class="font-semibold text-emerald-600">Suggested Category:</p>
                    <p class="text-gray-700">${suggestions.suggestedCategory}</p>
                  </div>
                ` : ''}
                ${suggestions.suggestedTags && suggestions.suggestedTags.length > 0 ? `
                  <div>
                    <p class="font-semibold text-emerald-600">Suggested Tags:</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                      ${suggestions.suggestedTags.map(tag => `<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">${tag}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `,
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Accept Suggestions',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#10b981',
            customClass: {
              htmlContainer: 'text-left',
            },
          });

          if (result.isConfirmed && onApplySuggestions) {
            onApplySuggestions(suggestions);
            Swal.fire({
              icon: 'success',
              title: 'Applied!',
              text: 'AI suggestions have been applied to your form.',
              timer: 2000,
            });
          }
        } catch (parseError) {
          console.error('[AIAssist] Parse error:', parseError);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to parse AI response.',
          });
        }
      } else {
        setError(response.data.error || 'Failed to get suggestions');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.error || 'Failed to get AI suggestions',
        });
      }
    } catch (err) {
      console.error('[AIAssist] Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Connection error';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleAIAssist}
      disabled={isLoading || !title.trim() || !description.trim()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition
        ${isLoading
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : !title.trim() || !description.trim()
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:from-emerald-600 hover:to-teal-600'
        }
        ${className}
      `}
      title={
        !title.trim() || !description.trim()
          ? 'Fill in title and description first'
          : 'Get AI suggestions for your item report'
      }
    >
      {isLoading ? (
        <>
          <FaSpinner className="animate-spin" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <FaMagic />
          <span>AI Assist</span>
        </>
      )}
    </motion.button>
  );
};

export default AIAssistButton;
