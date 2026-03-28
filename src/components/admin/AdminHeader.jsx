import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaBell,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
  FaTh,
  FaBox,
  FaComments,
  FaChartBar,
  FaClock,
  FaCog,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import AuthContext from '../../context/Authcontext/AuthContext';
import toast from 'react-hot-toast';

const AdminHeader = ({ unreadCount = 0 }) => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success('Logged out successfully');
      navigate('/admin-login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: FaTh },
    { path: '/admin/inventory', label: 'Inventory', icon: FaBox },
    { path: '/admin/claims', label: 'Claims', icon: FaComments },
    { path: '/admin/reports', label: 'Reports', icon: FaChartBar },
    { path: '/admin/activity', label: 'Activity', icon: FaClock },
    { path: '/admin/settings', label: 'Settings', icon: FaCog },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg">
      <div className="px-4 md:px-8 py-0">
        {/* Top row: Logo + User Menu */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-white bg-opacity-20">
              <span className="text-white font-bold text-sm">L&F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Campus L&F</h1>
              <p className="text-xs text-emerald-100 leading-none">Security Office</p>
            </div>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-white text-emerald-700'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              title="Notifications"
            >
              <FaBell size={18} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white bg-opacity-20 text-white text-xs font-bold">
                  {user?.displayName?.charAt(0) || 'A'}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-white">
                  {user?.displayName?.split(' ')[0] || 'Admin'}
                </span>
                <FaChevronDown size={12} className="text-white opacity-75" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/admin/settings');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <FaUser size={14} />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors border-t border-gray-200 mt-2"
                  >
                    <FaSignOutAlt size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaTimes size={20} className="text-white" />
              ) : (
                <FaBars size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden border-t border-emerald-500 bg-emerald-700 px-4 py-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-emerald-100 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
