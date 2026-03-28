import React, { memo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BottomCTA = memo(function BottomCTA() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const handleRegister = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  const handleSignin = useCallback(() => {
    navigate('/signin');
  }, [navigate]);

  const sectionAnimation = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    };

  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:px-10 md:py-14 lg:px-16"
          viewport={{ once: true, amount: 0.25 }}
          {...sectionAnimation}
        >
          {/* soft background accents */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-12 -left-10 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-44 w-44 rounded-full bg-slate-100/70 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 md:text-sm">
              Join the Community
            </span>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              Ready to Get Started?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-lg">
              Join students and staff who have already recovered lost items or
              helped others return them. Create your account today and become
              part of a trusted campus community.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleRegister}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 md:px-8 md:text-base"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={handleSignin}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-emerald-600 bg-white px-6 text-sm font-semibold text-emerald-600 transition-colors duration-200 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 md:px-8 md:text-base"
              >
                Sign In
              </button>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              It&apos;s free and takes less than a minute to sign up.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default BottomCTA;