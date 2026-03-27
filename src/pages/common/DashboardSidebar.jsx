import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaSearch, FaPlus, FaUser, FaHistory, FaBox, FaComment, FaCog } from "react-icons/fa";

const DashboardSidebar = ({ isOpen, onClose }) => {
    const menuItems = [
        {
            label: "Dashboard",
            path: "/app/dashboard",
            icon: FaHome,
            description: "Overview"
        },
        {
            label: "Search Items",
            path: "/app/search",
            icon: FaSearch,
            description: "Find items"
        },
        {
            label: "Post Item",
            path: "/app/post-item",
            icon: FaPlus,
            description: "Report lost/found"
        },
        {
            label: "My Items",
            path: "/app/my-items",
            icon: FaBox,
            description: "Your postings"
        },
        {
            label: "Messages",
            path: "/app/messages",
            icon: FaComment,
            description: "Inbox"
        },
        {
            label: "Activity",
            path: "/app/activity",
            icon: FaHistory,
            description: "Recent activity"
        },
        {
            label: "Profile",
            path: "/app/profile",
            icon: FaUser,
            description: "Account settings"
        }
    ];

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
            isActive
                ? "bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-100"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
        }`;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-30"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:relative top-16 lg:top-0 left-0 h-[calc(100vh-64px)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform duration-300 z-40 lg:z-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    aria-label="Close sidebar"
                >
                    <svg
                        className="w-5 h-5"
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

                {/* Navigation */}
                <nav className="p-4 pt-8 lg:pt-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={navLinkClass}
                                onClick={onClose}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-medium">{item.label}</div>
                                    <div className="text-xs opacity-70">{item.description}</div>
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 p-4">
                    <a
                        href="/contact"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Help & Support
                    </a>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
