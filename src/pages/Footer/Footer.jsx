import React, { memo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { schoolConfig } from '../../config/schoolConfig';
import AuthContext from '../../context/Authcontext/AuthContext';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa';

const FooterLink = memo(function FooterLink({ to, href, children, icon: Icon }) {
  const content = (
    <span className="group inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-white">
      {Icon ? (
        <Icon className="text-[15px] text-emerald-400 transition-colors duration-200 group-hover:text-emerald-300" />
      ) : null}
      <span>{children}</span>
    </span>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return (
    <a
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
    >
      {content}
    </a>
  );
});

const Footer = () => {
  const { user } = useContext(AuthContext);
  const contactLink = user ? '/app/contact' : '/contact';

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 md:pt-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <img
                  src="/zetech-logo.png"
                  alt="Zetech Foundit logo"
                  className="h-10 w-10 object-contain"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold leading-5 text-white sm:text-base">
                  {schoolConfig.name}
                </p>
                <p className="text-xs font-semibold text-emerald-400">
                  {schoolConfig.slogan}
                </p>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Official Lost & Found Portal helping students and staff reunite
              with their belongings quickly, safely, and more reliably.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
              Quick Links
            </h6>
            <div className="flex flex-col gap-3">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/aboutUs">About Us</FooterLink>
              <FooterLink to={contactLink}>Contact</FooterLink>
              {!user && <FooterLink to="/signin">Sign In</FooterLink>}
            </div>
          </div>

          {/* Information */}
          <div>
            <h6 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
              Information
            </h6>
            <div className="flex flex-col gap-3">
              <FooterLink to="/aboutUs">About Us</FooterLink>
              <FooterLink to={contactLink}>Contact</FooterLink>
              <FooterLink href="#">Terms of Use</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h6 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-white">
              Contact
            </h6>
            <div className="flex flex-col gap-3">
              <FooterLink href={`mailto:${schoolConfig.contact.email}`} icon={FaEnvelope}>
                {schoolConfig.contact.email}
              </FooterLink>

              <FooterLink href={`tel:${schoolConfig.contact.phone}`} icon={FaPhone}>
                {schoolConfig.contact.phone}
              </FooterLink>

              <div className="inline-flex items-start gap-2 text-sm font-medium text-slate-300">
                <FaMapMarkerAlt className="mt-0.5 text-[15px] text-emerald-400" />
                <span className="leading-6">{schoolConfig.contact.address}</span>
              </div>

              <FooterLink
                href={`https://${schoolConfig.contact.website}`}
                icon={FaGlobe}
              >
                {schoolConfig.contact.website}
              </FooterLink>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-slate-800" />

        {/* Bottom */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-sm text-slate-400 md:text-left">
            © {new Date().getFullYear()} {schoolConfig.name}. All Rights Reserved.
          </p>

          <div className="flex items-center justify-center gap-3 text-sm md:justify-end">
            <a href="#" className="font-medium text-slate-400 transition-colors duration-200 hover:text-emerald-400">
              Privacy
            </a>
            <span className="text-slate-700">•</span>
            <a href="#" className="font-medium text-slate-400 transition-colors duration-200 hover:text-emerald-400">
              Terms
            </a>
            <span className="text-slate-700">•</span>
            <a href="#" className="font-medium text-slate-400 transition-colors duration-200 hover:text-emerald-400">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);