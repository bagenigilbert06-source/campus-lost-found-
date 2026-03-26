import { useContext } from 'react';
import {
  FiMenu,
  FiBell,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext/AuthContext';

const AdminHeader = ({ onMenuClick, pageTitle }) => {
  const navigate = useNavigate();
  const { signOutUser, user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
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
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg">
            <FiBell size={20} className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="dropdown dropdown-end">
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900">
                  {user?.displayName || 'Admin'}
                </span>
                <span className="text-xs text-slate-500">Administrator</span>
              </div>
              <FiChevronDown size={16} className="text-slate-600" />
            </button>

            <ul className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-lg w-48">
              <li>
                <a href="/admin/settings">Settings</a>
              </li>
              <li>
                <a href="/admin/profile">Profile</a>
              </li>
              <li>
                <hr className="my-1" />
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:bg-red-50"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
