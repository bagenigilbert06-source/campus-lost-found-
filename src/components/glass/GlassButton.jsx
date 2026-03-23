import React from 'react';
import { motion } from 'framer-motion';

export const GlassButton = ({
  children,
  onClick = null,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon = null,
  iconPosition = 'left'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    outline: 'glass-button-outline'
  };

  const baseClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && iconPosition === 'left' && icon}
        {loading ? <span className="animate-spin">◌</span> : children}
        {icon && iconPosition === 'right' && icon}
      </div>
    </motion.button>
  );
};

export default GlassButton;
