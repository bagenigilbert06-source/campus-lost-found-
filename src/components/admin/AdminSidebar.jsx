import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiX,
  FiMenu,
} from 'react-icons/fi';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: FiHome },
    { label: 'Products', path: '/admin/products', icon: FiPackage },
    { label: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
    { label: 'Users', path: '/admin/users', icon: FiUsers },
    { label: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-300 z-40 lg:relative lg:transform-none lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Campus</h1>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Admin Dashboard v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
