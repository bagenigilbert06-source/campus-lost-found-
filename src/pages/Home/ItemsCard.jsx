import React, { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { normalizeImageUrl } from '../../utils/imageUtils';

const PlaceholderImage = memo(function PlaceholderImage() {
  return (
    <svg
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect width="300" height="200" fill="#e2e8f0" />
      <rect x="50" y="40" width="60" height="60" fill="#cbd5e1" rx="4" />
      <circle cx="220" cy="70" r="30" fill="#cbd5e1" />
      <path
        d="M 50 140 L 100 100 L 150 130 L 200 80 L 300 140 L 300 200 L 0 200 Z"
        fill="#a1aec9"
      />
      <text
        x="150"
        y="185"
        textAnchor="middle"
        fontSize="14"
        fill="#64748b"
        fontFamily="Arial"
      >
        No Image
      </text>
    </svg>
  );
});

const ItemsCard = memo(function ItemsCard({ item, delay = 0 }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);

  const {
    itemType,
    title,
    description,
    images,
    image,
    verificationStatus,
    _id,
    category,
  } = item;

  const isVerified = verificationStatus === 'verified';

  const imageUrl = useMemo(() => {
    let rawUrl = '';
    if (Array.isArray(images) && images.length > 0) rawUrl = images[0];
    else rawUrl = image || '';
    return normalizeImageUrl(rawUrl);
  }, [images, image]);

  const handleNavigate = useCallback(() => {
    navigate(`/items/${_id}`);
  }, [navigate, _id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const cardAnimation = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 16 },
      whileInView: { opacity: 1, y: 0 },
      transition: {
        duration: 0.4,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    };

  return (
    <motion.article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_14px_34px_rgba(16,185,129,0.08)]"
      viewport={{ once: true, amount: 0.2 }}
      onClick={handleNavigate}
      {...cardAnimation}
    >
      {/* Image */}
      <div className="relative flex h-40 flex-shrink-0 items-center justify-center overflow-hidden bg-slate-100 sm:h-44">
        {imageUrl && !imageError ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            src={imageUrl}
            alt={title || 'Item image'}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PlaceholderImage />
          </div>
        )}

        {/* Item type badge */}
        <div
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ${itemType === 'Lost'
              ? 'bg-red-500'
              : itemType === 'Found'
                ? 'bg-emerald-600'
                : 'bg-slate-700'
            }`}
        >
          {itemType || 'Item'}
        </div>

        {/* Verification badge */}
        <div
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ${isVerified ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
        >
          {isVerified ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
          <span>{isVerified ? 'Verified' : 'Pending'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-grow flex-col p-4 md:p-5">
        <div className="flex-grow">
          <h2 className="line-clamp-2 text-base font-semibold leading-6 text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">
            {title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {description || 'No description available.'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="inline-flex max-w-full items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="truncate">{category || 'Uncategorized'}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export default ItemsCard;