import React, { useMemo } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaPlus,
  FaUser,
  FaHistory,
  FaBox,
  FaComment,
  FaLifeRing,
} from "react-icons/fa";

const DashboardSidebar = ({ isOpen, onClose }) => {
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
        description: "Find items",
      },
      {
        label: "Post Item",
        path: "/app/post-item",
        icon: FaPlus,
        description: "Report lost/found",
      },
      {
        label: "My Items",
        path: "/app/my-items",
        icon: FaBox,
        description: "Your postings",
      },
      {
        label: "Messages",
        path: "/app/messages",
        icon: FaComment,
        description: "Inbox",
      },
      {
        label: "Activity",
        path: "/app/activity",
        icon: FaHistory,
        description: "Recent activity",
      },
      {
        label: "Profile",
        path: "/app/profile",
        icon: FaUser,
        description: "Account settings",
      },
    ],
    []
  );

  const navLinkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm transition-colors duration-200",
      isActive
        ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 ring-1 ring-emerald-200 shadow-sm"
        : "text-gray-600 hover:bg-emerald-50/70 hover:text-gray-900",
    ].join(" ");

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1.5px] transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-72 overflow-y-auto border-r border-emerald-100 bg-white/95 backdrop-blur-md transition-transform duration-300 ease-out will-change-transform lg:sticky lg:top-16 lg:z-20 lg:h-[calc(100vh-64px)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-full flex-col">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl border border-transparent p-2 text-gray-500 transition-colors duration-200 hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
            aria-label="Close sidebar"
            type="button"
          >
            <svg
              className="h-5 w-5"
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

          {/* Brand / Header */}
          <div className="border-b border-emerald-100 px-5 pb-4 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-lg font-bold text-white shadow-[0_8px_18px_rgba(16,185,129,0.22)]">
                Z
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-gray-900">
                  Student Dashboard
                </h2>
                <p className="truncate text-xs font-medium text-emerald-700">
                  Lost &amp; Found Portal
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-4 py-4">
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
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                        }`}
                      >
                        <Icon className="h-[17px] w-[17px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold leading-5">
                          {item.label}
                        </div>
                        <div
                          className={`truncate text-xs leading-5 ${
                            isActive ? "text-emerald-700/80" : "text-gray-500"
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-emerald-100 p-4">
            <Link
              to="/contact"
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100 transition-colors duration-200 hover:from-emerald-100 hover:to-green-100"
              onClick={onClose}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                <FaLifeRing className="h-[17px] w-[17px]" />
              </div>
              <div className="min-w-0">
                <div>Help &amp; Support</div>
                <div className="text-xs font-medium text-emerald-700/80 leading-5">
                  Contact our team
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;