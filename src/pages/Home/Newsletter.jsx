import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaBell } from 'react-icons/fa';
import { schoolConfig } from '../../config/schoolConfig';
import { GlassCard, GlassInput, GlassButton } from '../../components/glass';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            Swal.fire({
                icon: 'success',
                title: 'Subscribed!',
                text: 'You will receive notifications about matching items.',
                position: 'top',
                toast: true,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            setEmail('');
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeInOut', staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.section
            className="container mx-auto px-4 md:px-6 py-16 md:py-20"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
        >
            <div className="rounded-3xl p-8 md:p-16 overflow-hidden relative" style={{
                background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                boxShadow: '0 16px 40px rgba(16, 185, 129, 0.2)'
            }}>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
                
                <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
                    {/* Icon */}
                    <motion.div
                        className="mb-6"
                        variants={itemVariants}
                        whileHover={{ scale: 1.1 }}
                    >
                        <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm" style={{ borderColor: 'rgba(255, 255, 255, 0.3)', border: '2px solid' }}>
                            <FaBell className="text-white" size={32} />
                        </div>
                    </motion.div>

                    {/* Heading */}
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold text-white mb-4 text-center text-balance"
                        variants={itemVariants}
                    >
                        Stay Updated on Campus Items
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-white/90 font-medium text-center mb-10 max-w-2xl text-lg leading-relaxed"
                        variants={itemVariants}
                    >
                        Subscribe to get instant notifications when items matching your description are found at {schoolConfig.shortName}. Never miss a match!
                    </motion.p>

                    {/* Form */}
                    <motion.form
                        className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl"
                        onSubmit={handleSubmit}
                        variants={itemVariants}
                    >
                        <input
                            type="email"
                            placeholder="Enter your school email"
                            value={email}
                            onChange={handleChange}
                            required
                            className="flex-1 px-5 py-3.5 rounded-lg bg-white/95 text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-3.5 rounded-lg bg-white text-green-600 font-bold text-lg transition-all duration-300 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                        </motion.button>
                    </motion.form>

                    {/* Trust Message */}
                    <motion.p
                        className="text-sm text-white/75 mt-6 text-center font-medium"
                        variants={itemVariants}
                    >
                        We respect your privacy. Unsubscribe at any time.
                    </motion.p>
                </div>
            </div>
        </motion.section>
    );
};

export default Newsletter;
