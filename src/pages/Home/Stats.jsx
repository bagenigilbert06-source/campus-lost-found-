import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const Stats = memo(function Stats() {
  const shouldReduceMotion = useReducedMotion();

  const stats = useMemo(
    () => [
      {
        number: '2,500+',
        label: 'Items Recovered',
        description: 'Successfully reunited with owners',
      },
      {
        number: '5,000+',
        label: 'Active Users',
        description: 'Community members helping each other',
      },
      {
        number: '48 hrs',
        label: 'Average Recovery Time',
        description: 'Items found and returned quickly',
      },
      {
        number: '98%',
        label: 'Success Rate',
        description: 'Items verified and returned correctly',
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
          delayChildren: 0.05,
        },
    },
  };

  const itemVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 18 },
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 px-4 py-16 md:px-6 md:py-24">
      {/* soft background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 md:text-sm">
            Community Impact
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Our Impact in Numbers
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 md:text-lg">
            Real results from students and staff using the platform to report,
            search, and recover lost belongings faster.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={`${stat.label}-${index}`}
              variants={itemVariants}
              className="group rounded-2xl border border-white/15 bg-white/10 p-6 text-center text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/14 md:p-7"
            >
              <div className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                {stat.number}
              </div>

              <h3 className="text-base font-semibold text-white md:text-lg">
                {stat.label}
              </h3>

              <p className="mt-2 text-sm leading-6 text-emerald-50/85">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

export default Stats;