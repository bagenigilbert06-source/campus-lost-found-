<<<<<<< HEAD
import React, { memo, useMemo } from 'react';
import {
  FaClipboard,
  FaCheckSquare,
  FaAward,
  FaClock,
  FaLifeRing,
  FaHeadset,
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const SERVICES = [
  {
    icon: FaClipboard,
    title: 'Report Lost Items',
    description:
      'Quickly report your lost items with detailed descriptions, photos, and location information to increase recovery chances.',
  },
  {
    icon: FaCheckSquare,
    title: 'Report Found Items',
    description:
      'Help your fellow students by reporting items you found. Our system will match them with lost reports.',
  },
  {
    icon: FaAward,
    title: 'Verification & Claims',
    description:
      'Our security office verifies claims to ensure items are returned to their rightful owners safely.',
  },
  {
    icon: FaClock,
    title: '24/7 Item Storage',
    description:
      'Found items are securely stored at our facility and available for claiming during designated hours.',
  },
  {
    icon: FaLifeRing,
    title: 'Smart Matching',
    description:
      'Our advanced system automatically matches lost and found items based on descriptions and details.',
  },
  {
    icon: FaHeadset,
    title: 'Customer Support',
    description:
      'Dedicated support team available to help you track your items and answer any questions.',
  },
];

const PROCESS_STEPS = [
  {
    step: '1',
    title: 'Report',
    description: 'Report your lost or found item with details and photos.',
  },
  {
    step: '2',
    title: 'Match',
    description: 'Our system searches for matching items in our database.',
  },
  {
    step: '3',
    title: 'Notify',
    description: 'Get notified when a possible match is found.',
  },
  {
    step: '4',
    title: 'Claim',
    description: 'Verify ownership and claim your item through our secure process.',
  },
];

const ServiceCard = memo(function ServiceCard({ icon: Icon, title, description }) {
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

const ProcessStep = memo(function ProcessStep({ step, title, description }) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full
                   bg-emerald-600 text-base font-bold text-white"
      >
        {step}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
});

const ServicesPage = () => {
  const services = useMemo(() => SERVICES, []);
  const processSteps = useMemo(() => PROCESS_STEPS, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>{`Services - ${schoolConfig.name} Lost & Found`}</title>
        <meta
          name="description"
          content="Explore our lost and found services. Report items, verify ownership, get smart matching, and recover lost property easily."
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
              Campus Lost &amp; Found Services
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Fast, secure, and reliable item recovery services
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 md:text-lg">
              Everything students need to report, track, verify, and recover lost items
              with a smoother and more trusted campus experience.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white
                           px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors duration-200
                           hover:bg-emerald-50"
=======
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
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
              >
                Get Started
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
        </div>
      </section>

      {/* Services grid */}
      <section className="py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What we offer
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Designed to make the lost and found process simple, clear, and dependable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {services.map((service) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-6 pb-14 sm:pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 sm:px-8 md:px-10 md:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                How our service works
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                A simple step-by-step process that helps users recover items faster.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((item) => (
                <ProcessStep
                  key={item.step}
                  step={item.step}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-14 sm:pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl bg-emerald-600 px-6 py-10 text-center text-white sm:px-8 md:px-10 md:py-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Start using our services today
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Join students already using the platform to report, match, and recover lost items
              more easily.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white
                           px-6 py-3 text-sm font-semibold text-emerald-700
                           transition-colors duration-200 hover:bg-emerald-50"
              >
                Create Account
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/70
                           px-6 py-3 text-sm font-semibold text-white transition-colors duration-200
                           hover:bg-white/10"
              >
                Go Home
              </a>
            </div>
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
export default memo(ServicesPage);
=======
export default ServicesPage;
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
