import React from 'react';
import { motion } from 'framer-motion';
import { FaClipboard, FaCheckSquare, FaAward, FaClock, FaLifeRing, FaHeadset } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const ServicesPage = () => {
  const services = [
    {
      icon: FaClipboard,
      title: 'Report Lost Items',
      description: 'Quickly report your lost items with detailed descriptions, photos, and location information to increase recovery chances.'
    },
    {
      icon: FaCheckSquare,
      title: 'Report Found Items',
      description: 'Help your fellow students by reporting items you found. Our system will match them with lost reports.'
    },
    {
      icon: FaAward,
      title: 'Verification & Claims',
      description: 'Our security office verifies claims to ensure items are returned to their rightful owners safely.'
    },
    {
      icon: FaClock,
      title: '24/7 Item Storage',
      description: 'Found items are securely stored at our facility and available for claiming during designated hours.'
    },
    {
      icon: FaLifeRing,
      title: 'Smart Matching',
      description: 'Our advanced system automatically matches lost and found items based on descriptions and details.'
    },
    {
      icon: FaHeadset,
      title: 'Customer Support',
      description: 'Dedicated support team available to help you track your items and answer any questions.'
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
        <title>{`Services - ${schoolConfig.name} Lost & Found`}</title>
        <meta name="description" content="Explore our comprehensive lost and found services. Report items, verify ownership, get smart matching, and more at Zetech Lost & Found." />
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
              Our Services
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Complete solutions for reporting, finding, and recovering lost items on campus. We handle every step of the process.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 px-4 md:px-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
            variants={containerVariants}
          >
            {services.map((service, index) => {
              const Icon = service.icon;
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
                      <h3 className="font-semibold text-slate-900 mb-2">{service.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* How It Works */}
          <motion.div
            className="mt-16 p-8 md:p-12 rounded-2xl bg-slate-50 border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">Our Service Process</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Report',
                  description: 'Report your lost or found item with details and photos'
                },
                {
                  step: '2',
                  title: 'Match',
                  description: 'Our system searches for matching items in our database'
                },
                {
                  step: '3',
                  title: 'Notify',
                  description: 'Get notified when a match is found or someone reports your item'
                },
                {
                  step: '4',
                  title: 'Claim',
                  description: 'Verify ownership and claim your item through our secure process'
                }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-16 p-8 md:p-12 rounded-2xl bg-emerald-600 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Start Using Our Services Today</h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Join thousands of students who have successfully recovered their lost items through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-300"
              >
                Get Started
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

export default ServicesPage;
