import React, { useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import { schoolConfig } from "../../config/schoolConfig";

const Navbar = () => {
  const { user, signOutUser, isAdmin } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackAvatar =
    "https://ui-avatars.com/api/?name=User&background=10b981&color=ffffff";

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

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

  const navLinkClass = useCallback(
    ({ isActive }) =>
      [
        "navbar-link",
        isActive ? "navbar-link-active" : "navbar-link-inactive",
      ].join(" "),
    []
  );

  const mobileNavLinkClass = useCallback(
    ({ isActive }) =>
      [
        "mobile-navbar-link",
        isActive ? "mobile-navbar-link-active" : "mobile-navbar-link-inactive",
      ].join(" "),
    []
  );

  const mainLinks = useMemo(
    () => (
      <>
        <li><NavLink to="/" className={navLinkClass}>Home</NavLink></li>
        <li><NavLink to="/allItems" className={navLinkClass}>Lost &amp; Found Items</NavLink></li>
        <li><NavLink to="/aboutUs" className={navLinkClass}>About Us</NavLink></li>
        <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
      </>
    ),
    [navLinkClass]
  );

  const mobileMainLinks = useMemo(
    () => (
      <>
        <li><NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink></li>
        <li><NavLink to="/allItems" className={mobileNavLinkClass} onClick={closeMenu}>Lost &amp; Found Items</NavLink></li>
        <li><NavLink to="/aboutUs" className={mobileNavLinkClass} onClick={closeMenu}>About Us</NavLink></li>
        <li><NavLink to="/contact" className={mobileNavLinkClass} onClick={closeMenu}>Contact</NavLink></li>
      </>
    ),
    [mobileNavLinkClass, closeMenu]
  );

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="navbar-shell mx-auto max-w-7xl">
        <div className="navbar-glass border border-emerald-100/60 shadow-[0_10px_30px_rgba(16,185,129,0.08)]">
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
              <div className="brand-logo-shell flex items-center justify-center w-16 h-16 rounded-lg bg-white/10 flex-shrink-0 shadow-[0_8px_18px_rgba(16,185,129,0.22)]">
                <img
                  src="/zetech-logo.png"
                  alt="Zetech Foundit logo"
                  className="w-full h-full object-contain rounded"
                />
              </div>

              <div className="min-w-0 brand-text-wrap">
                <h1 className="brand-title">{schoolConfig.name}</h1>
                <p className="brand-subtitle">Find, report, and recover items easily</p>
              </div>
            </div>

            <nav className="hidden lg:block">
              <div className="nav-pill border border-emerald-100/70 bg-white/70 backdrop-blur-xl">
                <ul className="flex items-center gap-1">{mainLinks}</ul>
              </div>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <div className="hidden lg:flex items-center gap-3">
                    <Link to="/app/post-item" className="apple-btn apple-btn-secondary">
                      Add Item
                    </Link>

                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="apple-profile-btn"
                        title="Open account menu"
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-transparent transition duration-200 hover:ring-emerald-400/70">
                            <img
                              src={user?.photoURL || fallbackAvatar}
                              alt={user?.displayName || user?.email || "User profile"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <span className="hidden max-w-[120px] truncate text-sm xl:block transition-colors duration-200 hover:text-emerald-600">
                            {user?.displayName || "My Account"}
                          </span>
                        </div>
                      </button>

                      <ul
                        tabIndex={0}
                        className="dropdown-glass menu menu-sm dropdown-content mt-3 w-64 rounded-2xl border border-emerald-100/60 p-3 shadow-xl"
                      >
                        <li className="mb-2 px-3 py-2">
                          <Link to="/profile" className="flex flex-col items-start gap-1 transition-colors duration-200 hover:text-emerald-600">
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">
                              {user?.displayName || "User"}
                            </span>
                            <span className="max-w-full truncate text-xs text-slate-500 dark:text-slate-400">
                              {user?.email}
                            </span>
                          </Link>
                        </li>

                        <li><Link to="/profile">View Profile</Link></li>

                        {isAdmin ? (
                          <>
                            <li className="divider my-2"></li>
                            <li>
                              <Link to="/admin" className="bg-orange-50 text-orange-700 font-semibold dark:bg-orange-900 dark:text-orange-100">
                                Admin Dashboard
                              </Link>
                            </li>
                          </>
                        ) : (
                          <>
                            <li>
                              <Link to="/dashboard" className="bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-900 dark:text-emerald-100">
                                My Dashboard
                              </Link>
                            </li>
                            <li><Link to="/app/post-item">Add Lost &amp; Found Item</Link></li>
                            <li><Link to="/allRecovered">All Recovered Items</Link></li>
                            <li><Link to="/myItems">Manage My Items</Link></li>
                          </>
                        )}

                        <li className="mt-2">
                          <button onClick={handleSignOut} className="apple-btn apple-btn-primary w-full">
                            Sign Out
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="relative lg:hidden flex items-center gap-2">
                    <button
                      onClick={() => navigate("/profile")}
                      className="mobile-icon-btn transition duration-200 hover:ring-2 hover:ring-emerald-400/70"
                      aria-label="Go to profile"
                      title="Go to profile"
                      type="button"
                    >
                      <div className="h-9 w-9 overflow-hidden rounded-full">
                        <img
                          src={user?.photoURL || fallbackAvatar}
                          alt={user?.displayName || user?.email || "User profile"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </button>

                    <button
                      ref={buttonRef}
                      onClick={toggleMenu}
                      className="mobile-icon-btn"
                      aria-label="Toggle menu"
                      aria-expanded={isMenuOpen}
                      aria-controls="mobile-menu"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.2"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        {isMenuOpen ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-16 6h16" />
                        )}
                      </svg>
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
                      type="button"
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-16 6h16" />
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

      <div
        className={`relative overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out lg:hidden ${
          isMenuOpen ? "max-h-[700px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div
          id="mobile-menu"
          ref={menuRef}
          className="mobile-menu-glass mx-1 mt-3 rounded-2xl border border-emerald-100/60 p-4 shadow-xl"
        >
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 dark:bg-white/5">
                <div className="h-12 w-12 overflow-hidden rounded-full">
                  <img
                    src={user?.photoURL || fallbackAvatar}
                    alt={user?.displayName || user?.email || "User profile"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
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
                <li><NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>My Profile</NavLink></li>

                {isAdmin ? (
                  <li className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-700">
                    <NavLink
                      to="/admin"
                      className="mobile-navbar-link mobile-navbar-link-active bg-orange-100 dark:bg-orange-900"
                      onClick={closeMenu}
                    >
                      Admin Dashboard
                    </NavLink>
                  </li>
                ) : (
                  <>
                    <li><NavLink to="/dashboard" className="mobile-navbar-link mobile-navbar-link-active bg-emerald-100 dark:bg-emerald-900" onClick={closeMenu}>My Dashboard</NavLink></li>
                    <li><NavLink to="/app/post-item" className={mobileNavLinkClass} onClick={closeMenu}>Add Lost &amp; Found Item</NavLink></li>
                    <li><NavLink to="/allRecovered" className={mobileNavLinkClass} onClick={closeMenu}>All Recovered Items</NavLink></li>
                    <li><NavLink to="/myItems" className={mobileNavLinkClass} onClick={closeMenu}>Manage My Items</NavLink></li>
                  </>
                )}
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
    </header>
  );
};

export default Navbar;