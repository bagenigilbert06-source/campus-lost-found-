import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({
  children,
  className = '',
  hover = true,
  onClick = null,
  variant = 'default',
  animated = true,
  delay = 0
}) => {
  const variantStyles = {
    default: 'glass-card-default',
    elevated: 'glass-card-elevated',
    interactive: 'glass-card-interactive'
  };

  const baseClasses = `${variantStyles[variant]} ${className}`;

  const cardContent = (
    <div className={baseClasses}>
      {children}
    </div>
  );

  if (!animated) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4 } : {}}
    >
      {cardContent}
    </motion.div>
  );
};

export default GlassCard;
