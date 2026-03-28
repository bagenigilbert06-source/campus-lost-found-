import React, { useContext, useRef, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import {
  FaBars,
  FaHome,
  FaPlus,
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";
import NotificationsDropdown from "../../components/NotificationsDropdown";

const DashboardNavbar = ({ onToggleSidebar }) => {
  const { user, signOutUser, isAdmin } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const fallbackAvatar =
    "https://ui-avatars.com/api/?name=User&background=10b981&color=ffffff";

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMenuOpen) return;

      const clickedInsideMenu = menuRef.current?.contains(event.target);
      const clickedButton = buttonRef.current?.contains(event.target);

      if (!clickedInsideMenu && !clickedButton) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, closeMenu]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
      toast.success("Successfully signed out!");
      closeMenu();
      navigate("/");
    } catch {
      toast.error("Cannot sign out, please try again.");
    }
  }, [signOutUser, closeMenu, navigate]);

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 backdrop-blur-md shadow-[0_8px_24px_rgba(16,185,129,0.06)]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onToggleSidebar}
              className="rounded-xl p-2 text-gray-600 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
              aria-label="Toggle sidebar"
              type="button"
            >
              <FaBars className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-[0_6px_16px_rgba(16,185,129,0.18)]">
                <span className="text-sm font-bold text-white">Z</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Zetech
              </span>
            </div>
          </div>

          {/* Center quick actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FaHome className="h-4 w-4" />
              Dashboard
            </Link>

            <Link
              to="/app/search"
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <FaSearch className="h-4 w-4" />
              Search
            </Link>

            <Link
              to="/app/post-item"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,185,129,0.18)] transition duration-200 hover:brightness-105"
            >
              <FaPlus className="h-4 w-4" />
              Post Item
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationsDropdown />

            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="flex items-center gap-2 rounded-xl p-1.5 transition-colors duration-200 hover:bg-emerald-50"
              aria-label="User menu"
              aria-expanded={isMenuOpen}
              type="button"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-transparent transition duration-200 hover:ring-emerald-300">
                <img
                  src={user?.photoURL || fallbackAvatar}
                  alt={user?.displayName || "User"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 sm:inline">
                {user?.displayName || "Account"}
              </span>
            </button>

            {/* Dropdown */}
            <div
              className={`absolute right-4 top-16 z-50 w-60 origin-top-right overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-200 ${
                isMenuOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
              ref={menuRef}
            >
              <div className="border-b border-emerald-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.displayName || "User"}
                </p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="p-2">
                <Link
                  to="/app/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <FaHome className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  to="/app/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <FaUser className="h-4 w-4" />
                  My Profile
                </Link>

                {isAdmin && (
                  <>
                    <div className="my-2 h-px bg-emerald-100" />
                    <Link
                      to="/admin"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-orange-600 transition-colors duration-200 hover:bg-orange-50"
                    >
                      <FaShieldAlt className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </>
                )}

                <div className="my-2 h-px bg-emerald-100" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50"
                  type="button"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;