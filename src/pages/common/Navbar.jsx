import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";

const Navbar = () => {
    const { user, signOutUser } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const fallbackAvatar =
        "https://ui-avatars.com/api/?name=User&background=10b981&color=ffffff";

    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

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

    const navLinkClass = ({ isActive }) =>
        ["navbar-link", isActive ? "navbar-link-active" : "navbar-link-inactive"].join(" ");

    const mobileNavLinkClass = ({ isActive }) =>
        [
            "mobile-navbar-link",
            isActive ? "mobile-navbar-link-active" : "mobile-navbar-link-inactive",
        ].join(" ");

    const mainLinks = (
        <>
            <li><NavLink to="/" className={navLinkClass}>Home</NavLink></li>
            <li><NavLink to="/allItems" className={navLinkClass}>Lost &amp; Found Items</NavLink></li>
            <li><NavLink to="/aboutUs" className={navLinkClass}>About Us</NavLink></li>
            <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
        </>
    );

    const mobileMainLinks = (
        <>
            <li><NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink></li>
            <li><NavLink to="/allItems" className={mobileNavLinkClass} onClick={closeMenu}>Lost &amp; Found Items</NavLink></li>
            <li><NavLink to="/aboutUs" className={mobileNavLinkClass} onClick={closeMenu}>About Us</NavLink></li>
            <li><NavLink to="/contact" className={mobileNavLinkClass} onClick={closeMenu}>Contact</NavLink></li>
        </>
    );

    return (
        <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
            <div className="navbar-shell mx-auto max-w-7xl">
                <div className="navbar-glass">
                    <div className="mx-auto flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
                        <div
                            className="flex min-w-0 cursor-pointer items-center gap-3"
                            onClick={() => navigate("/")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") navigate("/");
                            }}
                        >
                            <div className="brand-logo-shell flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0">
                                <span className="text-2xl font-bold text-white">Z</span>
                            </div>

                            <div className="min-w-0 brand-text-wrap">
                                <h1 className="brand-title">Zetech Lost & Found</h1>
                                <p className="brand-subtitle">Find, report, and recover items easily</p>
                            </div>
                        </div>

                        <nav className="hidden lg:block">
                            <div className="nav-pill">
                                <ul className="flex items-center gap-1">{mainLinks}</ul>
                            </div>
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {user ? (
                                <>
                                    <div className="hidden lg:flex items-center gap-3">
                                        <Link to="/addItems" className="apple-btn apple-btn-secondary">
                                            Add Item
                                        </Link>

                                        <div className="dropdown dropdown-end">
                                            <button tabIndex={0} className="apple-profile-btn">
                                                <div className="h-10 w-10 overflow-hidden rounded-full">
                                                    <img
                                                        src={user?.photoURL || fallbackAvatar}
                                                        alt={user?.displayName || user?.email || "User profile"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <span className="hidden max-w-[120px] truncate text-sm xl:block">
                                                    {user?.displayName || "My Account"}
                                                </span>
                                            </button>

                                            <ul
                                                tabIndex={0}
                                                className="dropdown-glass menu menu-sm dropdown-content mt-3 w-64 rounded-2xl p-3 shadow-xl"
                                            >
                                                <li className="mb-2 px-3 py-2">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                                            {user?.displayName || "User"}
                                                        </span>
                                                        <span className="max-w-full truncate text-xs text-slate-500 dark:text-slate-400">
                                                            {user?.email}
                                                        </span>
                                                    </div>
                                                </li>

                                                <li><Link to="/addItems">Add Lost &amp; Found Item</Link></li>
                                                <li><Link to="/allRecovered">All Recovered Items</Link></li>
                                                <li><Link to="/myItems">Manage My Items</Link></li>
                                                <li className="mt-2">
                                                    <button onClick={handleSignOut} className="apple-btn apple-btn-primary w-full">
                                                        Sign Out
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="relative lg:hidden">
                                        <button
                                            ref={buttonRef}
                                            onClick={toggleMenu}
                                            className="mobile-icon-btn"
                                            aria-label="Toggle menu"
                                            aria-expanded={isMenuOpen}
                                            aria-controls="mobile-menu"
                                        >
                                            <div className="h-9 w-9 overflow-hidden rounded-full">
                                                <img
                                                    src={user?.photoURL || fallbackAvatar}
                                                    alt={user?.displayName || user?.email || "User profile"}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="hidden lg:flex items-center gap-3">
                                        <NavLink to="/register" className="apple-btn apple-btn-secondary">
                                            Sign Up
                                        </NavLink>
                                        <NavLink to="/signin" className="apple-btn apple-btn-primary">
                                            Sign In
                                        </NavLink>
                                    </div>

                                    <div className="relative lg:hidden">
                                        <button
                                            ref={buttonRef}
                                            onClick={toggleMenu}
                                            className="mobile-icon-btn"
                                            aria-label="Toggle navigation menu"
                                            aria-expanded={isMenuOpen}
                                            aria-controls="mobile-menu"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2.2"
                                                stroke="currentColor"
                                                className="h-5 w-5 text-slate-800 dark:text-white"
                                            >
                                                {isMenuOpen ? (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                ) : (
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M4 6h16M4 12h16m-16 6h16"
                                                    />
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="relative lg:hidden">
                    <div
                        id="mobile-menu"
                        ref={menuRef}
                        className="mobile-menu-glass animate-fade-in mx-1 mt-3 rounded-2xl p-4 shadow-xl"
                    >
                        {user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 rounded-2xl bg-white/50 p-3 dark:bg-white/5">
                                    <div className="h-12 w-12 overflow-hidden rounded-full">
                                        <img
                                            src={user?.photoURL || fallbackAvatar}
                                            alt={user?.displayName || user?.email || "User profile"}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                                            {user?.displayName || "User"}
                                        </p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>

                                <ul className="space-y-1">{mobileMainLinks}</ul>

                                <div className="h-px bg-black/5 dark:bg-white/10" />

                                <ul className="space-y-1">
                                    <li><NavLink to="/addItems" className={mobileNavLinkClass} onClick={closeMenu}>Add Lost &amp; Found Item</NavLink></li>
                                    <li><NavLink to="/allRecovered" className={mobileNavLinkClass} onClick={closeMenu}>All Recovered Items</NavLink></li>
                                    <li><NavLink to="/myItems" className={mobileNavLinkClass} onClick={closeMenu}>Manage My Items</NavLink></li>
                                </ul>

                                <button onClick={handleSignOut} className="apple-btn apple-btn-primary w-full">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <ul className="space-y-1">{mobileMainLinks}</ul>

                                <div className="h-px bg-black/5 dark:bg-white/10" />

                                <div className="grid grid-cols-1 gap-3">
                                    <NavLink
                                        to="/register"
                                        className="apple-btn apple-btn-secondary justify-center"
                                        onClick={closeMenu}
                                    >
                                        Sign Up
                                    </NavLink>
                                    <NavLink
                                        to="/signin"
                                        className="apple-btn apple-btn-primary justify-center"
                                        onClick={closeMenu}
                                    >
                                        Sign In
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
