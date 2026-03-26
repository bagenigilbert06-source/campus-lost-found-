import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { schoolConfig } from '../../config/schoolConfig';
import { 
  FaHome, 
  FaBoxes, 
  FaClipboardCheck, 
  FaUsers, 
  FaEnvelope, 
  FaCog, 
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const AdminSidebar = ({ isOpen, onClose, isMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { 
      section: 'Main',
      items: [
        { path: '/admin', icon: FaHome, label: 'Dashboard', exact: true },
        { path: '/admin/items', icon: FaBoxes, label: 'All Items' },
        { path: '/admin/pending', icon: FaClipboardCheck, label: 'Pending Review' },
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/admin/users', icon: FaUsers, label: 'Users' },
        { path: '/admin/messages', icon: FaEnvelope, label: 'Messages' },
        { path: '/admin/recovered', icon: FaCheckCircle, label: 'Recovered' },
      ]
    },
    {
      section: 'Reports',
      items: [
        { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
        { path: '/admin/alerts', icon: FaExclamationTriangle, label: 'Alerts' },
      ]
    },
    {
      section: 'System',
      items: [
        { path: '/admin/settings', icon: FaCog, label: 'Settings' },
      ]
    }
  ];

  const isActiveLink = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
    : `${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`${sidebarClasses} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col h-screen`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              {(!isCollapsed || isMobile) && (
                <div>
                  <h1 className="font-bold text-lg text-white">{schoolConfig.shortName}</h1>
                  <p className="text-xs text-slate-400">Admin Portal</p>
                </div>
              )}
            </div>
            {isMobile && (
              <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
                <FaTimes className="text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {(!isCollapsed || isMobile) && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                  {section.section}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      onClick={isMobile ? onClose : undefined}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-l-2 border-emerald-400' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }
                        ${isCollapsed && !isMobile ? 'justify-center' : ''}
                      `}
                    >
                      <item.icon className={`text-lg flex-shrink-0 ${isCollapsed && !isMobile ? '' : ''}`} />
                      {(!isCollapsed || isMobile) && (
                        <span className="font-medium text-sm">{item.label}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle - Desktop only */}
        {!isMobile && (
          <div className="p-3 border-t border-slate-700/50">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
              {!isCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;
