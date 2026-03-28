import React from 'react';
import { motion } from 'framer-motion';

export const GlassInput = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange = null,
  onFocus = null,
  onBlur = null,
  className = '',
  icon = null,
  error = false,
  disabled = false,
  label = null,
  helperText = null
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            glass-input
            w-full
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-600' : ''}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${className}
          `}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
      </div>
      {helperText && (
        <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-slate-500'}`}>
          {helperText}
        </p>
      )}
    </motion.div>
  );
};

export default GlassInput;
