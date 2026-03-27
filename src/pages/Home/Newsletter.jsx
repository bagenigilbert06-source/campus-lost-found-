import React, { memo, useCallback, useState } from 'react';
import Swal from 'sweetalert2';
import { motion, useReducedMotion } from 'framer-motion';
import { FaBell } from 'react-icons/fa';

const Newsletter = memo(function Newsletter() {
    const shouldReduceMotion = useReducedMotion();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((e) => {
        setEmail(e.target.value);
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (isSubmitting) return;

            setIsSubmitting(true);

            try {
                await Swal.fire({
                    icon: 'success',
                    title: 'Subscribed!',
                    text: 'You will receive notifications about matching items.',
                    position: 'top-end',
                    toast: true,
                    showConfirmButton: false,
                    timer: 2600,
                    timerProgressBar: true,
                    background: '#ffffff',
                    color: '#0f172a',
                });

                setEmail('');

                if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [isSubmitting]
    );

    const sectionAnimation = shouldReduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        };

    return (
        <motion.section
            className="px-4 py-16 md:px-6 md:py-24"
            viewport={{ once: true, amount: 0.2 }}
            {...sectionAnimation}
        >
            <div className="mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 px-6 py-10 text-white shadow-[0_18px_50px_rgba(16,185,129,0.14)] md:px-10 md:py-14 lg:px-14">
                    {/* Background accents */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-12 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute right-0 bottom-0 h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />
                    </div>

                    <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                        {/* Icon */}
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                            <FaBell className="text-2xl text-white" />
                        </div>

                        {/* Heading */}
                        <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 md:text-sm">
                            Stay Updated
                        </span>

                        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                            Get Updates on Campus Items
                        </h2>

                        {/* Description */}
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 md:text-lg">
                            Subscribe to receive notifications when items matching your lost
                            belongings are found on campus.
                        </p>

                        {/* Form */}
                        <form
                            className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
                            onSubmit={handleSubmit}
                        >
                            <label htmlFor="newsletter-email" className="sr-only">
                                Email address
                            </label>

                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                disabled={isSubmitting}
                                className="h-12 flex-1 rounded-xl border border-white/20 bg-white px-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-80 md:h-13 md:px-5 md:text-base"
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-70 md:h-13 md:px-8 md:text-base"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>

                        {/* Trust Message */}
                        <p className="mt-5 text-sm text-emerald-50/85">
                            We respect your privacy. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
});

export default Newsletter;