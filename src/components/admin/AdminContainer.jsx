import React from 'react';

const AdminContainer = ({ children, className = '' }) => {
  return (
    <div className={`px-4 md:px-8 py-6 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default AdminContainer;
