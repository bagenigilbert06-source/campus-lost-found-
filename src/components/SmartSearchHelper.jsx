import React, { useState, useCallback, useRef } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const SmartSearchHelper = ({
  onSearchSubmit,
  placeholder = 'Search items...',
  className = '',
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);

  // Debounced function to get suggestions
  const getSearchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const apiHost = import.meta.env.VITE_API_BASE_URL || (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await axios.post(
        `${apiHost}/gemini/improve-search`,
        { query: searchQuery },
        { timeout: 15000 }
      );

      if (response.data.success && response.data.content) {
        try {
          const data = JSON.parse(response.data.content);
          const allSuggestions = [
            ...(data.alternatives || []),
            data.improvedQuery,
          ].filter((s) => s && s !== searchQuery);

          setSuggestions(allSuggestions.slice(0, 4)); // Limit to 4 suggestions
          setShowDropdown(true);
        } catch (parseError) {
          console.warn('[SmartSearch] Parse error:', parseError);
        }
      }
    } catch (err) {
      console.warn('[SmartSearch] Suggestions error:', err.message);
      // Gracefully degrade - don't show suggestions if AI fails
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [showSuggestions]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce the suggestion fetch
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      getSearchSuggestions(value);
    }, 400); // 400ms debounce
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    setShowDropdown(false);

    // Call the provided search handler
    if (onSearchSubmit) {
      onSearchSubmit(suggestion);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearchSubmit) {
      onSearchSubmit(query);
    }
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          <FaSearch className="absolute left-3 text-gray-400 pointer-events-none" />

          {/* Loading indicator */}
          {isLoadingSuggestions && (
            <FaSpinner className="absolute right-3 text-emerald-500 animate-spin pointer-events-none" />
          )}

          {/* Submit button */}
          {!isLoadingSuggestions && (
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-3 text-emerald-600 hover:text-emerald-700 disabled:text-gray-300 transition"
            >
              <FaSearch />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <p className="text-xs text-gray-500 font-semibold px-3 py-1 mb-1">
                💡 AI Suggestions
              </p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 rounded text-sm text-gray-700 hover:text-emerald-600 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SmartSearchHelper;
