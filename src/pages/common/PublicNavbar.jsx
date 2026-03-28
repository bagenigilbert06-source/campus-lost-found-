<<<<<<< HEAD
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const navLinkClass = useCallback(
    ({ isActive }) =>
      ["navbar-link", isActive ? "navbar-link-active" : "navbar-link-inactive"].join(" "),
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
        <li><NavLink to="/features" className={navLinkClass}>Features</NavLink></li>
        <li><NavLink to="/services" className={navLinkClass}>Services</NavLink></li>
        <li><NavLink to="/faq" className={navLinkClass}>FAQ</NavLink></li>
        <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
      </>
    ),
    [navLinkClass]
  );

  const mobileMainLinks = useMemo(
    () => (
      <>
        <li><NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink></li>
        <li><NavLink to="/features" className={mobileNavLinkClass} onClick={closeMenu}>Features</NavLink></li>
        <li><NavLink to="/services" className={mobileNavLinkClass} onClick={closeMenu}>Services</NavLink></li>
        <li><NavLink to="/faq" className={mobileNavLinkClass} onClick={closeMenu}>FAQ</NavLink></li>
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
            {/* Logo */}
            <div
              className="flex min-w-0 cursor-pointer items-center gap-3"
              onClick={() => navigate("/")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/");
              }}
            >
              <div className="brand-logo-shell flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-[0_8px_18px_rgba(16,185,129,0.22)]">
                <span className="text-2xl font-bold text-white">Z</span>
              </div>

              <div className="min-w-0 brand-text-wrap">
                <h1 className="brand-title">Zetech Lost &amp; Found</h1>
                <p className="brand-subtitle">Find, report, and recover items easily</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:block">
              <div className="nav-pill border border-emerald-100/70 bg-white/70 backdrop-blur-xl">
                <ul className="flex items-center gap-1">{mainLinks}</ul>
              </div>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/signin" className="apple-btn apple-btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="apple-btn apple-btn-primary">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
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
                  className="h-5 w-5 text-slate-800"
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
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`relative overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out lg:hidden ${
          isMenuOpen
            ? "max-h-[480px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div
          id="mobile-menu"
          ref={menuRef}
          className="mobile-menu-glass mx-1 mt-3 rounded-2xl border border-emerald-100/60 p-4 shadow-xl"
        >
          <div className="space-y-4">
            <ul className="space-y-1">{mobileMainLinks}</ul>

            <div className="h-px bg-black/5 dark:bg-white/10" />

            <div className="flex flex-col gap-3">
              <Link
                to="/signin"
                onClick={closeMenu}
                className="apple-btn apple-btn-secondary w-full justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="apple-btn apple-btn-primary w-full justify-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
=======
import React, { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

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
            <li><NavLink to="/features" className={navLinkClass}>Features</NavLink></li>
            <li><NavLink to="/services" className={navLinkClass}>Services</NavLink></li>
            <li><NavLink to="/faq" className={navLinkClass}>FAQ</NavLink></li>
            <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
        </>
    );

    const mobileMainLinks = (
        <>
            <li><NavLink to="/" className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink></li>
            <li><NavLink to="/features" className={mobileNavLinkClass} onClick={closeMenu}>Features</NavLink></li>
            <li><NavLink to="/services" className={mobileNavLinkClass} onClick={closeMenu}>Services</NavLink></li>
            <li><NavLink to="/faq" className={mobileNavLinkClass} onClick={closeMenu}>FAQ</NavLink></li>
            <li><NavLink to="/contact" className={mobileNavLinkClass} onClick={closeMenu}>Contact</NavLink></li>
        </>
    );

    return (
        <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
            <div className="navbar-shell mx-auto max-w-7xl">
                <div className="navbar-glass">
                    <div className="mx-auto flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
                        {/* Logo */}
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

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:block">
                            <div className="nav-pill">
                                <ul className="flex items-center gap-1">{mainLinks}</ul>
                            </div>
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={() => navigate("/signin")}
                                className="apple-btn apple-btn-secondary"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate("/register")}
                                className="apple-btn apple-btn-primary"
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
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
                    className="h-5 w-5 text-slate-800"
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
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="relative lg:hidden">
                    <div
                        id="mobile-menu"
                        ref={menuRef}
                        className="mobile-menu-glass animate-fade-in mx-1 mt-3 rounded-2xl p-4 shadow-xl"
                    >
                        <div className="space-y-4">
                            <ul className="space-y-1">{mobileMainLinks}</ul>

                            <div className="h-px bg-black/5 dark:bg-white/10" />

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        navigate("/signin");
                                        closeMenu();
                                    }}
                                    className="apple-btn apple-btn-secondary w-full"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        navigate("/register");
                                        closeMenu();
                                    }}
                                    className="apple-btn apple-btn-primary w-full"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicNavbar;
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
