import React from 'react';
import { motion } from 'framer-motion';

export const GlassBottomActionBar = ({
  actions = [],
  visible = true,
  onClose = null
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 lg:pb-0"
    >
      <div className="glass-bottom-action-bar rounded-t-3xl lg:rounded-3xl p-4 flex gap-3 justify-center lg:justify-end lg:max-w-md lg:mx-auto">
        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            onClick={action.onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex-1 lg:flex-none
              px-6 py-2 rounded-lg font-medium
              transition-all duration-200
              ${action.variant === 'primary' 
                ? 'bg-gradient-to-r from-zetech-primary to-zetech-secondary text-white shadow-lg hover:shadow-xl' 
                : 'bg-white/20 dark:bg-slate-700/20 text-slate-900 dark:text-white border border-white/30 dark:border-slate-600/30 hover:bg-white/30 dark:hover:bg-slate-700/30'
              }
            `}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default GlassBottomActionBar;
