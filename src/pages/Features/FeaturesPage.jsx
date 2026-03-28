<<<<<<< HEAD
import React, { memo, useMemo } from 'react';
import {
  FaSearch,
  FaBell,
  FaShieldAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserFriends,
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const FEATURES = [
  {
    icon: FaSearch,
    title: 'Smart Search',
    description:
      'Quickly search for lost items across campus with filters for category, location, and date.',
  },
  {
    icon: FaBell,
    title: 'Real-Time Notifications',
    description:
      'Get notified instantly when items matching your lost item reports are found.',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure Verification',
    description:
      'Security office verification helps ensure items are returned to their rightful owners.',
  },
  {
    icon: FaCheckCircle,
    title: 'Easy Claiming',
    description:
      'A simple and secure process to claim your lost items or return found items.',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Location Tracking',
    description:
      'See where items were found to make recovery and identification easier.',
  },
  {
    icon: FaUserFriends,
    title: 'Community Driven',
    description:
      'Work together with the campus community to reunite people with their belongings.',
  },
];

const FeatureCard = memo(function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article
      className="group h-full rounded-2xl border border-slate-200 bg-white p-6
                 transition-colors duration-200 hover:border-emerald-300"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl
                     bg-emerald-50 text-emerald-600"
        >
          <Icon className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
});

const FeaturesPage = () => {
  const features = useMemo(() => FEATURES, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>{`Features - ${schoolConfig.name} Lost & Found`}</title>
        <meta
          name="description"
          content={`Discover the core features of ${schoolConfig.name} Lost & Found platform, including smart search, notifications, secure verification, and easier item recovery.`}
        />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 md:text-sm">
              Platform Features
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Powerful features built for faster item recovery
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 md:text-lg">
              Everything you need to report, search, match, verify, and recover lost
              items with a smoother and more trusted campus experience.
            </p>
          </div>
=======
import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaBell, FaShieldAlt, FaCheckCircle, FaMapMarkerAlt, FaUserFriends } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const FeaturesPage = () => {
  const features = [
    {
      icon: FaSearch,
      title: 'Smart Search',
      description: 'Quickly search for lost items across campus with filters for category, location, and date.'
    },
    {
      icon: FaBell,
      title: 'Real-Time Notifications',
      description: 'Get notified instantly when items matching your lost items are found.'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure Verification',
      description: 'Security office verification ensures items are returned to their rightful owners.'
    },
    {
      icon: FaCheckCircle,
      title: 'Easy Claiming',
      description: 'Simple verification process to claim your lost items or return found items.'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Location Tracking',
      description: 'View where items were found to help with recovery and identification.'
    },
    {
      icon: FaUserFriends,
      title: 'Community Driven',
      description: 'Connect with your campus community to reunite with lost belongings.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`Features - ${schoolConfig.name} Lost & Found`}</title>
        <meta name="description" content="Discover the powerful features of Zetech Lost & Found platform. Smart search, real-time notifications, secure verification, and more." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gradient-to-r from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to quickly find or report lost items on campus. Our platform is designed to make recovering your belongings effortless.
            </p>
          </motion.div>
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
        </div>
      </section>

      {/* Features Grid */}
<<<<<<< HEAD
      <section className="py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What makes the platform useful
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Built to be simple, secure, and efficient for both students and staff.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-14 sm:pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl bg-emerald-600 px-6 py-10 text-center text-white sm:px-8 md:px-10 md:py-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Join the platform today and make reporting or finding lost items easier,
              faster, and more reliable.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white
                           px-6 py-3 text-sm font-semibold text-emerald-700
                           transition-colors duration-200 hover:bg-emerald-50"
=======
      <section className="py-16 md:py-24 px-4 md:px-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                  variants={itemVariants}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-100">
                      <Icon className="text-emerald-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-16 p-8 md:p-12 rounded-2xl bg-emerald-600 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Join our community today and never lose track of your belongings again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-300"
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
              >
                Sign Up Now
              </a>
              <a
                href="/"
<<<<<<< HEAD
                className="inline-flex items-center justify-center rounded-xl border border-white/70
                           px-6 py-3 text-sm font-semibold text-white transition-colors duration-200
                           hover:bg-white/10"
=======
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300"
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
              >
                Back to Home
              </a>
            </div>
<<<<<<< HEAD
          </div>
=======
          </motion.div>
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
        </div>
      </section>
    </div>
  );
};

<<<<<<< HEAD
export default memo(FeaturesPage);
=======
export default FeaturesPage;
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
