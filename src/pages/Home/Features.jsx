import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FaSearch,
  FaBell,
  FaShieldAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserFriends,
} from 'react-icons/fa';

const Features = memo(function Features() {
  const shouldReduceMotion = useReducedMotion();

  const features = useMemo(
    () => [
      {
        id: 1,
        icon: FaSearch,
        title: 'Smart Search',
        description:
          'Quickly search for lost items across campus with filters for category, location, and date.',
      },
      {
        id: 2,
        icon: FaBell,
        title: 'Real-Time Notifications',
        description:
          'Get notified instantly when items matching your lost item reports are found.',
      },
      {
        id: 3,
        icon: FaShieldAlt,
        title: 'Secure Verification',
        description:
          'Verification support helps ensure items are returned to their rightful owners safely.',
      },
      {
        id: 4,
        icon: FaCheckCircle,
        title: 'Easy Claiming',
        description:
          'A simple and clear process makes it easy to claim lost items or return found belongings.',
      },
      {
        id: 5,
        icon: FaMapMarkerAlt,
        title: 'Location Tracking',
        description:
          'See where items were found to make recovery and identification faster and easier.',
      },
      {
        id: 6,
        icon: FaUserFriends,
        title: 'Community Driven',
        description:
          'Work together with students and staff to reconnect people with what they lost.',
      },
    ],
    []
  );

  const containerVariants = {
    hidden: {},
    show: {
      transition: shouldReduceMotion
        ? {}
        : {
          staggerChildren: 0.08,
          delayChildren: 0.04,
        },
    },
  };

  const cardVariants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    show: shouldReduceMotion
      ? { opacity: 1 }
      : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        },
      },
  };

  const headerAnimation = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    };

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
          viewport={{ once: true, amount: 0.25 }}
          {...headerAnimation}
        >
          <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 md:text-sm">
            Key Features
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            Powerful Features for Faster Recovery
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-lg">
            Everything you need to report, search, verify, and recover lost
            items across campus with ease.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.id}
                variants={cardVariants}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_16px_40px_rgba(16,185,129,0.08)] md:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 transition-colors duration-300 group-hover:bg-emerald-100">
                    <Icon className="text-xl text-emerald-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

export default Features;