import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationDialog = ({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {},
  isDangerous = false,
  isLoading = false
}) => {
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
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full mx-4 z-50"
          >
            {/* Modal Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
              {/* Icon Section */}
              <div className={`flex items-center justify-center pt-6 ${isDangerous ? 'text-red-500' : 'text-blue-500'}`}>
                {isDangerous ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full"
                  >
                    <FaExclamationTriangle size={32} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full"
                  >
                    <FaTrash size={32} />
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <motion.button
                  onClick={onCancel}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    isDangerous
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isLoading && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    </motion.div>
                  )}
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
