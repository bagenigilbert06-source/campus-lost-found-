import React, { useContext, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaCog,
  FaQuestionCircle,
  FaChevronDown,
} from "react-icons/fa";
import NotificationsDropdown from "../../components/NotificationsDropdown";

const DashboardNavbar = ({ onToggleSidebar }) => {
  const { user, signOutUser, isAdmin } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      toast.success("Successfully signed out");
      closeMenu();
      navigate("/");
    } catch {
      toast.error("Cannot sign out, please try again.");
    }
  }, [signOutUser, closeMenu, navigate]);

  const getInitials = useCallback(() => {
    if (user?.displayName) {
      const names = user.displayName.trim().split(" ");
      if (names.length === 1) return names[0].slice(0, 1).toUpperCase();
      return `${names[0].slice(0, 1)}${names[1].slice(0, 1)}`.toUpperCase();
    }

    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "U";
  }, [user]);

  const firstName = useMemo(() => {
    if (user?.displayName) return user.displayName.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "Account";
  }, [user]);

  const navLinks = useMemo(
    () => [
      {
        label: "Dashboard",
        to: "/app/dashboard",
        icon: FaHome,
      },
      {
        label: "Search",
        to: "/app/search",
        icon: FaSearch,
      },
    ],
    []
  );

  const profileMenuLinks = useMemo(
    () => [
      {
        label: "Dashboard",
        to: "/app/dashboard",
        icon: FaHome,
      },
      {
        label: "My Profile",
        to: "/app/profile",
        icon: FaUser,
      },
      {
        label: "Settings",
        to: "/app/settings",
        icon: FaCog,
      },
      {
        label: "Help & Support",
        to: "/app/help",
        icon: FaQuestionCircle,
      },
    ],
    []
  );

  const isActiveRoute = useCallback(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
    [location.pathname]
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3 lg:w-[280px]">
            <button
              onClick={onToggleSidebar}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
              aria-label="Toggle sidebar"
              type="button"
            >
              <FaBars className="h-4 w-4" />
            </button>

            <Link
              to="/app/dashboard"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
                Z
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Zetech Lost &amp; Found
                </p>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Authenticated workspace
                </p>
              </div>
            </Link>
          </div>

          {/* Center */}
          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <nav className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {navLinks.map(({ label, to, icon: Icon }) => {
                const active = isActiveRoute(to);

                return (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                      active
                        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 lg:w-[320px]">
            <Link
              to="/app/search"
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 md:inline-flex lg:hidden"
            >
              <FaSearch className="h-4 w-4" />
              <span>Search</span>
            </Link>

            <Link
              to="/app/post-item"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3.5 text-sm font-semibold text-white sm:px-4"
            >
              <FaPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Post Item</span>
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <NotificationsDropdown />
            </div>

            <div className="relative">
              <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-1.5 pr-2 sm:px-2 sm:pr-3"
                aria-label="User menu"
                aria-expanded={isMenuOpen}
                type="button"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL || fallbackAvatar}
                      alt={user?.displayName || "User"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{getInitials()}</span>
                  )}
                </div>

                <div className="hidden min-w-0 text-left xl:block">
                  <p className="max-w-[120px] truncate text-sm font-semibold text-slate-900">
                    {firstName}
                  </p>
                  <p className="max-w-[140px] truncate text-xs text-slate-500">
                    {isAdmin ? "Admin" : "Student"}
                  </p>
                </div>

                <FaChevronDown
                  className={`hidden h-3.5 w-3.5 text-slate-400 xl:block ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                ref={menuRef}
                className={`absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ${
                  isMenuOpen ? "block" : "hidden"
                }`}
              >
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL || fallbackAvatar}
                          alt={user?.displayName || "User"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{getInitials()}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user?.displayName || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user?.email || "No email available"}
                      </p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                        {isAdmin ? "Administrator" : "Student Account"}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="p-2">
                  {profileMenuLinks.map(({ label, to, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                      <span>{label}</span>
                    </Link>
                  ))}

                  {isAdmin && (
                    <>
                      <div className="my-2 h-px bg-slate-100" />
                      <Link
                        to="/admin"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
                      >
                        <FaShieldAlt className="h-4 w-4 shrink-0" />
                        <span>Admin Panel</span>
                      </Link>
                    </>
                  )}

                  <div className="my-2 h-px bg-slate-100" />

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    type="button"
                  >
                    <FaSignOutAlt className="h-4 w-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;