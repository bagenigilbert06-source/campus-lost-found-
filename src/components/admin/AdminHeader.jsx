import { useContext, useState } from 'react';
import {
  FiMenu,
  FiBell,
  FiLogOut,
  FiChevronDown,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext/AuthContext';

const AdminHeader = ({ onMenuClick, pageTitle }) => {
  const navigate = useNavigate();
  const { signOutUser, user } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInitials = user?.email 
    ? user.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <FiMenu size={20} className="text-slate-600" />
          </button>
          {pageTitle && (
            <h2 className="text-lg font-semibold text-slate-900 hidden sm:block">
              {pageTitle}
            </h2>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button 
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors group"
            aria-label="Notifications"
          >
            <FiBell size={20} className="text-slate-600 group-hover:text-slate-900" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {userInitials}
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900">
                  {user?.displayName || 'Administrator'}
                </span>
                <span className="text-xs text-slate-500">Admin</span>
              </div>
              <FiChevronDown 
                size={16} 
                className={`text-slate-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-lg z-50">
                  <div className="p-4 border-b border-slate-200">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.email || 'admin@example.com'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Administrator Account</p>
                  </div>

                  <nav className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        navigate('/admin/settings');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <FiSettings size={16} />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/admin/profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <FiUser size={16} />
                      <span>Profile</span>
                    </button>
                  </nav>

                  <div className="p-2 border-t border-slate-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
