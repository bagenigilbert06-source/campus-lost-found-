import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({ 
  icon: Icon = FaInbox,
  title = 'No data found',
  description = 'There is no data to display',
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="bg-zetech-primary/10 p-6 rounded-full mb-4">
        <Icon size={40} className="text-zetech-primary" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      {action && (
        <div className="flex gap-3">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
