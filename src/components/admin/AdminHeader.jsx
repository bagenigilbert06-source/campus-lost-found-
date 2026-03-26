import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import { 
  FaBars, 
  FaBell, 
  FaSignOutAlt, 
  FaUser,
  FaSearch,
  FaChevronDown
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminHeader = ({ onMenuClick, pageTitle = 'Dashboard', unreadCount = 0 }) => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success('Logged out successfully');
      navigate('/admin-login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FaBars className="text-xl" />
            </button>
            
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-slate-800">{pageTitle}</h1>
              <p className="text-xs text-slate-500 hidden sm:block">{schoolConfig.name} Lost & Found</p>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search - Desktop */}
            <div className="hidden md:block relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search items..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Search - Mobile */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FaSearch />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-500/20">
                  {getInitials(user?.displayName)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
                    {user?.displayName || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500">Security Officer</p>
                </div>
                <FaChevronDown className={`hidden lg:block text-slate-400 text-xs transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="font-semibold text-slate-800 truncate">{user?.displayName || 'Admin'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setShowDropdown(false); navigate('/admin/settings'); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FaUser className="text-slate-400" />
                      Profile Settings
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-100">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search items..."
                autoFocus
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
