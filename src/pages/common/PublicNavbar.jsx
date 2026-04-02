import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { schoolConfig } from "../../config/schoolConfig";

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
      [
        "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      ].join(" "),
    []
  );

  const mobileNavLinkClass = useCallback(
    ({ isActive }) =>
      [
        "flex items-center rounded-xl px-3 py-3 text-sm font-medium",
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
      ].join(" "),
    []
  );

  const mainLinks = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Features", to: "/features" },
      { label: "Services", to: "/services" },
      { label: "FAQ", to: "/faq" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <div
            className="flex min-w-0 cursor-pointer items-center gap-3"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/30 shadow-sm">
              <img
                src="/zetech-logo.png"
                alt="Zetech Foundit logo"
                className="h-12 w-12 object-contain"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-900">
                {schoolConfig.name}
              </h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                Find, report, and recover items easily
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:flex-1 lg:justify-center">
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {mainLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/signin"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              {isMenuOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            ref={menuRef}
            className="border-t border-slate-200 bg-white py-4 lg:hidden"
          >
            <div className="space-y-4">
              <ul className="space-y-1">
                {mainLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={mobileNavLinkClass}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="h-px bg-slate-200" />

              <div className="flex flex-col gap-3">
                <Link
                  to="/signin"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicNavbar;