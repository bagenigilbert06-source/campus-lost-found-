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
        </div>
      </section>

      {/* Features Grid */}
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
              >
                Sign Up Now
              </a>
              <a
                href="/"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300"
              >
                Back to Home
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
