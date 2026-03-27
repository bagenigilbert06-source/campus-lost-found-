import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { schoolConfig } from '../../config/schoolConfig';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaArrowRight } from 'react-icons/fa';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const LinkItem = ({ to, href, children, icon: Icon }) => {
    const content = (
      <motion.div
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-300 group"
        whileHover={{ x: 4 }}
        variants={itemVariants}
      >
        {Icon && <Icon className="text-green-400 group-hover:text-green-300 transition-colors" size={16} />}
        <span className="text-sm font-medium">{children}</span>
      </motion.div>
    );

    return to ? <Link to={to}>{content}</Link> : <a href={href} target={href ? '_blank' : undefined} rel={href ? 'noopener noreferrer' : undefined}>{content}</a>;
  };

  return (
    <footer className="bg-slate-900 text-white pt-20 pb-8" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Main Footer Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Brand Section */}
          <motion.div className="flex flex-col gap-4" variants={itemVariants}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{schoolConfig.shortName}</span>
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-white">{schoolConfig.name}</p>
                <p className="text-xs text-green-400 font-semibold">{schoolConfig.slogan}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Official Lost & Found Portal helping students and staff reunite with their belongings.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h6 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Quick Links</h6>
            <div className="flex flex-col gap-3">
              <LinkItem to="/">Home</LinkItem>
              <LinkItem to="/aboutUs">About Us</LinkItem>
              <LinkItem to="/contact">Contact</LinkItem>
              <LinkItem to="/signin">Sign In</LinkItem>
            </div>
          </motion.div>

          {/* Information */}
          <motion.div variants={itemVariants}>
            <h6 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Information</h6>
            <div className="flex flex-col gap-3">
              <LinkItem to="/aboutUs">About Us</LinkItem>
              <LinkItem to="/contact">Contact</LinkItem>
              <LinkItem href="#">Terms of Use</LinkItem>
              <LinkItem href="#">Privacy Policy</LinkItem>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h6 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Contact</h6>
            <div className="flex flex-col gap-3">
              <LinkItem href={`mailto:${schoolConfig.contact.email}`} icon={FaEnvelope}>
                {schoolConfig.contact.email}
              </LinkItem>
              <LinkItem href={`tel:${schoolConfig.contact.phone}`} icon={FaPhone}>
                {schoolConfig.contact.phone}
              </LinkItem>
              <motion.div className="flex items-center gap-2 text-slate-300" variants={itemVariants}>
                <FaMapMarkerAlt className="text-green-400" size={16} />
                <span className="text-sm font-medium">{schoolConfig.contact.address}</span>
              </motion.div>
              <LinkItem href={`https://${schoolConfig.contact.website}`} icon={FaGlobe}>
                {schoolConfig.contact.website}
              </LinkItem>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>

        {/* Footer Bottom */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-slate-400 text-center md:text-left">
            © {new Date().getFullYear()} {schoolConfig.name} Lost & Found. All Rights Reserved.
          </p>
          <motion.div
            className="flex gap-4 mt-4 md:mt-0"
            whileHover={{ gap: 20 }}
          >
            <a href="#" className="text-slate-400 hover:text-green-400 transition-colors text-sm font-medium">
              Privacy
            </a>
            <span className="text-slate-600">•</span>
            <a href="#" className="text-slate-400 hover:text-green-400 transition-colors text-sm font-medium">
              Terms
            </a>
            <span className="text-slate-600">•</span>
            <a href="#" className="text-slate-400 hover:text-green-400 transition-colors text-sm font-medium">
              Cookies
            </a>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
