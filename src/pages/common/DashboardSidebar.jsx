import React, { useContext, useMemo } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaPlus,
  FaUser,
  FaHistory,
  FaBox,
  FaComment,
  FaLifeRing,
  FaSignOutAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";

const DashboardSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOutUser } = useContext(AuthContext);

  const menuItems = useMemo(
    () => [
      {
        label: "Dashboard",
        path: "/app/dashboard",
        icon: FaHome,
        description: "Overview",
      },
      {
        label: "Search Items",
        path: "/app/search",
        icon: FaSearch,
        description: "Find lost and found items",
      },
      {
        label: "Post Item",
        path: "/app/post-item",
        icon: FaPlus,
        description: "Report a lost or found item",
      },
      {
        label: "My Items",
        path: "/app/my-items",
        icon: FaBox,
        description: "Manage your posted items",
      },
      {
        label: "Messages",
        path: "/app/messages",
        icon: FaComment,
        description: "Check conversations",
      },
      {
        label: "Activity",
        path: "/app/activity",
        icon: FaHistory,
        description: "Recent account activity",
      },
      {
        label: "Profile",
        path: "/app/profile",
        icon: FaUser,
        description: "Account and personal details",
      },
    ],
    []
  );

  const navLinkClass = ({ isActive }) =>
    [
      "group flex items-start gap-3 rounded-2xl px-3 py-2.5",
      isActive
        ? "bg-emerald-50 text-emerald-900"
        : "text-slate-600 hover:bg-white hover:text-slate-900",
    ].join(" ");

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success("Logged out successfully");
      onClose?.();
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/30 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-72 border-r border-slate-200 bg-[#f8faf8] lg:sticky lg:top-16 lg:z-20 lg:h-[calc(100vh-64px)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative shrink-0 border-b border-slate-200 px-4 pb-3 pt-4">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
              aria-label="Close sidebar"
              type="button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <Link
              to="/app/dashboard"
              onClick={onClose}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white">
                Z
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  Zetech Lost &amp; Found
                </h2>
                <p className="truncate text-xs text-slate-500">
                  Student workspace
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="min-h-0 flex-1 px-3 py-3">
            <div className="mb-2 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Main Navigation
              </p>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={navLinkClass}
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-emerald-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold leading-5">
                            {item.label}
                          </div>
                          <div
                            className={`mt-0.5 truncate text-[12px] leading-4 ${
                              isActive ? "text-emerald-700/80" : "text-slate-500"
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>

                        {isActive ? (
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom actions */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <div className="space-y-2">
              <Link
                to="/contact"
                onClick={onClose}
                className="group flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 ring-1 ring-emerald-100">
                  <FaLifeRing className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-emerald-900">
                    Help &amp; Support
                  </div>
                  <div className="mt-0.5 text-xs leading-4 text-emerald-700/80">
                    Get help from our support team.
                  </div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                type="button"
                className="flex w-full items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 ring-1 ring-rose-100">
                  <FaSignOutAlt className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-rose-900">
                    Logout
                  </div>
                  <div className="mt-0.5 text-xs leading-4 text-rose-700/80">
                    Sign out of your account safely.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;