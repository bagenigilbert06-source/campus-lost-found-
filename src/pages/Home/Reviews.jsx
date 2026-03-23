import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import { GlassCard } from '../../components/glass';

const Reviews = () => {
    const [reviews] = useState([
        {
            "_id": "1",
            "name": "Kariuki Mwangi",
            "rating": 5,
            "comment": "This platform helped me recover my lost bag in no time! Excellent service and a very user-friendly interface. Highly recommended!"
        },
        {
            "_id": "2",
            "name": "Amara Ochieng",
            "rating": 5,
            "comment": "Found my missing phone using this platform in just 2 hours. The process was super easy and the community is incredibly helpful!"
        },
        {
            "_id": "3",
            "name": "David Kipchoge",
            "rating": 5,
            "comment": "Amazing! Lost my wallet on campus and got it back within 24 hours. The interface is clean and the notifications are very timely."
        },
        {
            "_id": "4",
            "name": "Fatima Hassan",
            "rating": 4,
            "comment": "Great platform with quick response times. Found someone's keys and was able to return them easily. Very intuitive design!"
        },
        {
            "_id": "5",
            "name": "James Mutua",
            "rating": 5,
            "comment": "Reliable and trustworthy. Posted my lost keys and recovered them the same day. The community spirit here is wonderful."
        },
        {
            "_id": "6",
            "name": "Zara Kamau",
            "rating": 5,
            "comment": "Fantastic experience! Simple interface, quick connections, and my lost backpack was returned within hours. Truly impressed!"
        }
    ]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsPerSlide, setCardsPerSlide] = useState(1);

    const totalReviews = reviews.length;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setCardsPerSlide(3);
            } else if (window.innerWidth >= 768) {
                setCardsPerSlide(2);
            } else {
                setCardsPerSlide(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const goToNextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + cardsPerSlide) % totalReviews);
    };

    const goToPreviousSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - cardsPerSlide + totalReviews) % totalReviews);
    };

    const StarRating = ({ rating }) => (
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
                <FaStar
                    key={i}
                    className={i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}
                    size={16}
                />
            ))}
        </div>
    );

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 mb-12">
            {/* Header Section */}
            <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Student Testimonials
                </motion.h2>
                <motion.p 
                  className="text-lg text-slate-600 font-medium max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Hear from Zetech students who've successfully recovered their lost items through our platform.
                </motion.p>
            </motion.div>

            {/* Slider Container */}
            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * (100 / cardsPerSlide)}%)` }}
                >
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review._id}
                            className={`flex-shrink-0 w-full px-2 md:px-3 ${
                                cardsPerSlide === 3 ? 'md:w-1/3' : cardsPerSlide === 2 ? 'md:w-1/2' : 'w-full'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                            <div
                                className="rounded-2xl p-6 md:p-7 h-full flex flex-col transition-all duration-300 hover:shadow-lg"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.85)',
                                    border: '1px solid rgba(16, 185, 129, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)'
                                }}
                            >
                                {/* Star Rating - Top */}
                                <div className="mb-4 flex items-center gap-1">
                                    <StarRating rating={review.rating} />
                                </div>

                                {/* Comment Text */}
                                <p className="text-slate-700 text-sm md:text-base leading-relaxed flex-grow mb-5 font-medium">
                                    "{review.comment}"
                                </p>

                                {/* Divider */}
                                <div className="h-px bg-gradient-to-r from-transparent via-green-200 to-transparent mb-4"></div>

                                {/* Name and Badge */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {review.name}
                                    </h3>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                                        <span className="text-xs font-semibold text-green-700">{review.rating}/5</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <motion.button
                    onClick={goToPreviousSlide}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 glass-button-primary p-3 z-10 hidden md:flex items-center justify-center"
                >
                    <FaChevronLeft size={20} />
                </motion.button>
                <motion.button
                    onClick={goToNextSlide}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 glass-button-primary p-3 z-10 hidden md:flex items-center justify-center"
                >
                    <FaChevronRight size={20} />
                </motion.button>
            </div>

            {/* Dots Indicator for Mobile */}
            <div className="flex justify-center gap-2 mt-6 md:hidden">
                {[...Array(Math.ceil(totalReviews / cardsPerSlide))].map((_, idx) => (
                    <motion.button
                        key={idx}
                        onClick={() => setCurrentIndex(idx * cardsPerSlide)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            Math.floor(currentIndex / cardsPerSlide) === idx
                                ? 'bg-zetech-primary w-8'
                                : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        whileHover={{ scale: 1.2 }}
                    />
                ))}
            </div>

            {/* Footer Section */}
            <motion.div
                className="text-center mt-14"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
            >
                <Link to="/addReview">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        className="glass-button-primary px-8 py-3.5 text-white font-semibold rounded-xl text-base"
                    >
                        Share Your Experience
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
};

export default Reviews;

