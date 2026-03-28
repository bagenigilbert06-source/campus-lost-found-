import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaPen, FaBell, FaCheckCircle, FaHandshake } from 'react-icons/fa';

const HowItWorks = memo(function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  const steps = useMemo(
    () => [
      {
        id: 1,
        icon: FaPen,
        number: '01',
        title: 'Report an Item',
        description:
          'Sign in and report your lost or found item with important details such as photos, location, and date.',
      },
      {
        id: 2,
        icon: FaBell,
        number: '02',
        title: 'Get Notified',
        description:
          'Receive timely notifications when matching items are found or when someone responds to your report.',
      },
      {
        id: 3,
        icon: FaCheckCircle,
        number: '03',
        title: 'Verification',
        description:
          'A clear verification process helps confirm ownership and protects users from fraud.',
      },
      {
        id: 4,
        icon: FaHandshake,
        number: '04',
        title: 'Recovery',
        description:
          'Coordinate with the finder or collect your item safely from the campus lost and found office.',
      },
    ],
    []
  );

  const headerAnimation = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    };

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

  const itemVariants = {
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

  return (
    <section className="bg-slate-50 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
          viewport={{ once: true, amount: 0.25 }}
          {...headerAnimation}
        >
          <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 md:text-sm">
            Simple Process
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            How It Works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-lg">
            A simple four-step process designed to help students and staff
            report, verify, and recover lost belongings with confidence.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                variants={itemVariants}
                className="relative"
              >
                <article className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_16px_40px_rgba(16,185,129,0.08)] md:p-7">
                  {/* Number badge */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white shadow-[0_10px_25px_rgba(16,185,129,0.20)]">
                      {step.number}
                    </div>

                    <div className="hidden text-sm font-semibold text-emerald-600 lg:block">
                      Step {index + 1}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
                    <Icon className="text-xl text-emerald-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute top-1/2 -right-3 hidden -translate-y-1/2 lg:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-lg text-emerald-300 shadow-sm">
                      →
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
});

export default HowItWorks;