import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { GlassCard, GlassButton } from '../../components/glass';

const ItemsCard = ({ item, delay = 0 }) => {
  const { itemType, title, description, image, verificationStatus, _id } = item;
  const navigate = useNavigate();
  
  const isVerified = verificationStatus === 'verified';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)' }}
      className="cursor-pointer h-full flex flex-col overflow-hidden rounded-xl border transition-all duration-300"
      onClick={() => navigate(`/items/${_id}`)}
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
        boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Image Section with Tags */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex-shrink-0">
        <motion.img
          className="w-full h-full object-cover"
          src={image || 'https://via.placeholder.com/300'}
          alt={title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300';
          }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Item Type Badge */}
        <motion.div
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold shadow-md text-white rounded-full ${
            itemType === 'Lost' 
              ? 'bg-red-500' 
              : itemType === 'Found' 
              ? 'bg-green-500' 
              : 'bg-zetech-primary'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          {itemType}
        </motion.div>

        {/* Verification Badge */}
        <motion.div
          className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold shadow-md rounded-full flex items-center gap-1 ${
            isVerified 
              ? 'bg-green-500 text-white' 
              : 'bg-amber-500 text-white'
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          {isVerified ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
          <span className="hidden sm:inline">{isVerified ? 'Verified' : 'Pending'}</span>
        </motion.div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-grow p-4 gap-2.5">
        {/* Title */}
        <motion.h2
          className="text-base font-bold text-slate-900 line-clamp-2 leading-tight"
          whileHover={{ color: '#10b981' }}
        >
          {title}
        </motion.h2>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-1 flex-grow">
          {description}
        </p>

        {/* Category Badge */}
        <motion.div
          className="inline-flex items-center w-fit px-2.5 py-1 rounded-md text-xs font-semibold text-green-700 bg-green-50 border border-green-200"
          whileHover={{ scale: 1.05 }}
        >
          {item.category || 'Uncategorized'}
        </motion.div>

        {/* Action Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="pt-1"
        >
          <GlassButton
            onClick={() => navigate(`/items/${_id}`)}
            variant="primary"
            size="sm"
            className="w-full text-sm py-2"
          >
            View Details
          </GlassButton>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ItemsCard;

