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
        </div>
      </section>

      {/* Features Grid */}
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
              >
                Sign Up Now
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/70
                           px-6 py-3 text-sm font-semibold text-white transition-colors duration-200
                           hover:bg-white/10"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(FeaturesPage);