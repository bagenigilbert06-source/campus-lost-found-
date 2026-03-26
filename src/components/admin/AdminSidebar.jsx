import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartLine, 
  FaBoxes, 
  FaComments, 
  FaFileAlt, 
  FaClock, 
  FaCog, 
  FaBars,
  FaTimes,
  FaHome
} from 'react-icons/fa';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard', end: true },
    { path: '/admin/inventory', icon: FaBoxes, label: 'Inventory' },
    { path: '/admin/claims', icon: FaComments, label: 'Claims & Messages' },
    { path: '/admin/reports', icon: FaFileAlt, label: 'Reports' },
    { path: '/admin/activity', icon: FaClock, label: 'Activity Log' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
  ];

  const isActive = (path, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 h-screen w-64 
        bg-gradient-to-b from-zetech-dark to-zetech-primary
        text-white overflow-y-auto transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="px-6 py-8 border-b border-zetech-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Campus L&F</h2>
            <button 
              onClick={onClose}
              className="md:hidden text-white hover:bg-zetech-secondary/20 p-2 rounded"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <p className="text-zetech-light/70 text-sm">Security Office</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.end);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-zetech-secondary text-white shadow-lg' 
                    : 'text-zetech-light/80 hover:bg-zetech-secondary/30 hover:text-white'
                  }
                `}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-zetech-secondary/30">
          <p className="text-xs text-zetech-light/50 text-center">Admin Panel v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
