import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaCheckCircle, FaGraduationCap } from 'react-icons/fa';
import { schoolConfig } from '../../config/schoolConfig';

const About = () => {
  const highlights = [
    {
      icon: FaGraduationCap,
      title: 'Campus-Wide Platform',
      description: 'Dedicated service for students and staff at Zetech'
    },
    {
      icon: FaUsers,
      title: 'Community Focused',
      description: 'Built on trust and collective effort to help each other'
    },
    {
      icon: FaCheckCircle,
      title: 'Verified & Secure',
      description: 'Security office verification ensures safe item recovery'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Why Choose {schoolConfig.shortName}?
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              {schoolConfig.name} Lost & Found is a secure, community-driven platform designed specifically for our campus community. We understand the urgency of losing important items and the joy of helping others recover theirs.
            </p>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Our platform combines modern technology with personal security measures to ensure every lost item has the best chance of being found and safely returned to its owner.
            </p>

            {/* Quick Facts */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    variants={itemVariants}
                  >
                    <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-100">
                      <Icon className="text-emerald-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Content - Value Proposition */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50">
              <h3 className="font-semibold text-emerald-900 mb-2">For Students & Staff</h3>
              <p className="text-emerald-700 text-sm">
                Lose something on campus? Report it instantly and get real-time notifications when it's found. Our community is here to help.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Security First</h3>
              <p className="text-slate-600 text-sm">
                Every claim goes through security office verification to ensure items are returned to the rightful owner and prevent fraud.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Easy & Fast</h3>
              <p className="text-slate-600 text-sm">
                Simple reporting process, smart matching, and fast recovery. Most items are reunited with owners within 24-48 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
