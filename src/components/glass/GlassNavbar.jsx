import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';

export const GlassNavbar = ({
  logo = null,
  brand = 'Brand',
  links = [],
  actions = null,
  theme = 'light',
  onThemeToggle = null
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 glass-navbar">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          {logo && <img src={logo} alt={brand} className="w-12 h-12 rounded-full" />}
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-zetech-dark via-zetech-primary to-zetech-accent dark:from-zetech-accent dark:via-zetech-primary dark:to-zetech-secondary bg-clip-text text-transparent">
              {brand}
            </h1>
          </div>
        </motion.div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((link, idx) => (
            <motion.a
              key={idx}
              href={link.href}
              whileHover={{ scale: 1.05 }}
              className="text-slate-700 dark:text-slate-300 hover:text-zetech-primary dark:hover:text-zetech-accent transition"
            >
              {link.label}
            </motion.a>
          ))}
        </nav>

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {onThemeToggle && (
            <motion.button
              onClick={onThemeToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white/20 dark:bg-slate-700/20 hover:bg-white/30 dark:hover:bg-slate-700/30 transition"
            >
              {theme === 'light' ? (
                <FaMoon className="text-slate-600 dark:text-yellow-400" size={18} />
              ) : (
                <FaSun className="text-yellow-400" size={18} />
              )}
            </motion.button>
          )}

          {/* Actions */}
          {actions && (
            <div className="hidden lg:flex gap-2">
              {actions}
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            className="lg:hidden p-2 rounded-lg bg-white/20 dark:bg-slate-700/20 hover:bg-white/30 dark:hover:bg-slate-700/30 transition"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden glass-mobile-menu border-t border-white/20 dark:border-slate-700/20"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map((link, idx) => (
              <motion.a
                key={idx}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-700 dark:text-slate-300 hover:text-zetech-primary dark:hover:text-zetech-accent transition py-2"
              >
                {link.label}
              </motion.a>
            ))}
            {actions && (
              <div className="flex gap-2 mt-4 border-t border-white/20 dark:border-slate-700/20 pt-4">
                {actions}
              </div>
            )}
          </nav>
        </motion.div>
      )}
    </div>
  );
};

export default GlassNavbar;
