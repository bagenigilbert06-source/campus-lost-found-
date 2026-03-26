import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars,
  FaBell,
  FaSignOutAlt,
  FaUser,
  FaChevronDown
} from 'react-icons/fa';
import AuthContext from '../../context/Authcontext/AuthContext';
import toast from 'react-hot-toast';

const AdminHeader = ({ onToggleSidebar, unreadCount = 0 }) => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success('Logged out successfully');
      navigate('/admin-login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-20">
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Menu Toggle & Title */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onToggleSidebar}
              className="md:hidden btn btn-ghost btn-circle"
              title="Toggle Menu"
            >
              <FaBars size={20} className="text-zetech-primary" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-zetech-primary">
                Security Office
              </h1>
              <p className="text-xs text-gray-500">Manage lost & found items</p>
            </div>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="btn btn-ghost btn-circle relative" title="Notifications">
              <FaBell size={18} className="text-zetech-primary" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <button
                className="btn btn-ghost gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zetech-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.displayName?.charAt(0) || 'A'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user?.displayName || 'Admin'}
                  </span>
                </div>
                <FaChevronDown size={12} className="text-gray-500" />
              </button>

              {isDropdownOpen && (
                <ul className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li className="menu-title">
                    <span>{user?.email}</span>
                  </li>
                  <li>
                    <a href="/admin/settings">
                      <FaUser size={16} />
                      Profile Settings
                    </a>
                  </li>
                  <li className="border-t">
                    <button onClick={handleLogout}>
                      <FaSignOutAlt size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
