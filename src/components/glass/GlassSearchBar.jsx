import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';

export const GlassSearchBar = ({
  onSearch = null,
  placeholder = 'Search items...',
  onClear = null,
  className = '',
  suggestions = [],
  onSuggestionClick = null
}) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    
    if (val && suggestions.length > 0) {
      setFilteredSuggestions(
        suggestions.filter(s => 
          s.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }

    onSearch?.(val);
  };

  const handleClear = () => {
    setValue('');
    setFilteredSuggestions([]);
    onClear?.();
  };

  const handleSuggestionClick = (suggestion) => {
    setValue(suggestion);
    setFilteredSuggestions([]);
    onSuggestionClick?.(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full ${className}`}
    >
      <div className="glass-search-bar flex items-center gap-2 relative">
        <FaSearch className="text-slate-400 dark:text-slate-300" size={18} />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="glass-search-input flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
        />
        {value && (
          <motion.button
            onClick={handleClear}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <FaTimes size={16} />
          </motion.button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && filteredSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 right-0 mt-2 glass-dropdown rounded-lg overflow-hidden z-50"
        >
          {filteredSuggestions.map((suggestion, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 transition"
            >
              {suggestion}
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GlassSearchBar;
