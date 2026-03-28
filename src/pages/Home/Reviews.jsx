import React, { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const Reviews = memo(function Reviews() {
    const shouldReduceMotion = useReducedMotion();

    const reviews = useMemo(
        () => [
            {
                id: 1,
                name: 'Sarah Wanjiku',
                role: 'Student',
                review:
                    'I lost my phone on campus and got it back the next day through this platform. The process was simple, fast, and very trustworthy.',
                rating: 5,
            },
            {
                id: 2,
                name: 'Brian Kiptoo',
                role: 'Campus Security Volunteer',
                review:
                    'This system has made it much easier to connect found items with their owners. It feels organized, clear, and very practical.',
                rating: 5,
            },
            {
                id: 3,
                name: 'Mercy Achieng',
                role: 'Student',
                review:
                    'I posted my lost ID and within hours someone reached out. I really like how clean and easy the platform is to use.',
                rating: 5,
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

    return (
        <section className="bg-white px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <motion.div
                    className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 md:text-sm">
                        Testimonials
                    </span>

                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
                        What Our Community Says
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-lg">
                        Trusted by students and staff who use the platform to recover lost
                        belongings quickly and safely.
                    </p>
                </motion.div>

                {/* Reviews Grid */}
                <motion.div
                    className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                >
                    {reviews.map((review) => (
                        <motion.article
                            key={review.id}
                            variants={cardVariants}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_16px_40px_rgba(16,185,129,0.08)] md:p-7"
                        >
                            {/* Stars */}
                            <div className="mb-4 flex items-center gap-1">
                                {Array.from({ length: review.rating }).map((_, index) => (
                                    <FaStar
                                        key={index}
                                        className="h-4 w-4 fill-emerald-500 text-emerald-500"
                                    />
                                ))}
                            </div>

                            {/* Review text */}
                            <p className="text-sm leading-7 text-slate-600 md:text-base">
                                “{review.review}”
                            </p>

                            {/* User */}
                            <div className="mt-6 border-t border-slate-100 pt-4">
                                <h3 className="text-base font-semibold text-slate-900">
                                    {review.name}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">{review.role}</p>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
});

export default Reviews;