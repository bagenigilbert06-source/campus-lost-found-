import React from 'react';

const LoadingState = ({ count = 3, type = 'card' }) => {
  if (type === 'full') {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="loading loading-dots loading-lg text-zetech-primary"></span>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
};

export default LoadingState;
