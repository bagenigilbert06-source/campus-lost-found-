import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

export const GlassModal = ({
  isOpen = false,
  onClose = null,
  title = '',
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              glass-modal ${sizeClasses[size]}
              w-full mx-4 z-50
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200/20 dark:border-slate-700/20">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>
              {showCloseButton && (
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  <FaTimes size={20} />
                </motion.button>
              )}
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlassModal;
