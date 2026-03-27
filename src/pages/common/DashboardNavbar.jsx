import React, { useContext, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import { FaBars, FaTimes, FaHome, FaPlus, FaSearch, FaUser, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import NotificationsDropdown from "../../components/NotificationsDropdown";

const DashboardNavbar = ({ onToggleSidebar }) => {
    const { user, signOutUser, isAdmin } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    const fallbackAvatar =
        "https://ui-avatars.com/api/?name=User&background=10b981&color=ffffff";

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!isMenuOpen) return;

            const clickedInsideMenu = menuRef.current?.contains(event.target);
            const clickedButton = buttonRef.current?.contains(event.target);

            if (!clickedInsideMenu && !clickedButton) {
                closeMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleSignOut = async () => {
        try {
            await signOutUser();
            toast.success("Successfully signed out!");
            closeMenu();
            navigate("/");
        } catch {
            toast.error("Cannot sign out, please try again.");
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo / Brand for Mobile */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={onToggleSidebar}
                            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition"
                            aria-label="Toggle sidebar"
                        >
                            <FaBars className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="flex items-center gap-2 lg:hidden">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-bold text-white">Z</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">Zetech</span>
                        </div>
                    </div>

                    {/* Quick Actions - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/app/dashboard"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition"
                        >
                            <FaHome className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <Link
                            to="/app/search"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition"
                        >
                            <FaSearch className="w-4 h-4" />
                            Search
                        </Link>
                        <Link
                            to="/app/post-item"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition"
                        >
                            <FaPlus className="w-4 h-4" />
                            Post
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                        <button
                            ref={buttonRef}
                            onClick={toggleMenu}
                            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            aria-label="User menu"
                            aria-expanded={isMenuOpen}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                    src={user?.photoURL || fallbackAvatar}
                                    alt={user?.displayName || "User"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                                {user?.displayName || "Account"}
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div
                                ref={menuRef}
                                className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56 z-50"
                            >
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user?.displayName || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email}
                                    </p>
                                </div>

                                {/* Menu Items */}
                                <Link
                                    to="/app/dashboard"
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <FaHome className="w-4 h-4" />
                                    Dashboard
                                </Link>

                                <Link
                                    to="/app/profile"
                                    onClick={closeMenu}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                >
                                    <FaUser className="w-4 h-4" />
                                    My Profile
                                </Link>

                                {isAdmin && (
                                    <>
                                        <div className="border-t border-gray-200 my-2" />
                                        <Link
                                            to="/admin"
                                            onClick={closeMenu}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium transition"
                                        >
                                            <FaShieldAlt className="w-4 h-4" />
                                            Admin Panel
                                        </Link>
                                    </>
                                )}

                                <div className="border-t border-gray-200 my-2" />

                                {/* Sign Out */}
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition text-left"
                                >
                                    <FaSignOutAlt className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardNavbar;
