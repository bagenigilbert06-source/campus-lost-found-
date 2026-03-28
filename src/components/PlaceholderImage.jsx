import React from 'react';

const PlaceholderImage = ({ className = "w-full h-full" }) => {
  return (
    <svg className={className} viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="placeholderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#placeholderGradient)" />
      <rect x="50" y="40" width="60" height="60" fill="#a1aec9" rx="4" opacity="0.6" />
      <circle cx="220" cy="70" r="30" fill="#a1aec9" opacity="0.6" />
      <path d="M 50 140 L 100 100 L 150 130 L 200 80 L 300 140 L 300 200 L 0 200 Z" fill="#94a3b8" opacity="0.4" />
      <text x="150" y="185" textAnchor="middle" fontSize="14" fill="#64748b" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500">
        No Image Available
      </text>
    </svg>
  );
};

export default PlaceholderImage;
