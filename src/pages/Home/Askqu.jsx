import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaShieldAlt, FaUserCheck, FaBell, FaQuestion } from 'react-icons/fa';

const Askqu = () => {
    const [activeCategory, setActiveCategory] = useState('general');
    const [expandedItem, setExpandedItem] = useState(0);

    const categories = [
        { id: 'general', label: 'Getting Started', icon: FaShieldAlt },
        { id: 'security', label: 'Security & Privacy', icon: FaShieldAlt },
        { id: 'claims', label: 'Claiming Items', icon: FaUserCheck },
        { id: 'notifications', label: 'Notifications', icon: FaBell }
    ];

    const faqs = {
        general: [
            {
                question: 'How do I report a lost item?',
                answer: 'Sign in to your account, click "Report Item," select "Lost," and fill out the form with detailed descriptions, photos, location, and date. The security office will verify your report within 24 hours.'
            },
            {
                question: 'What should I do if I find an item?',
                answer: 'Click "Report Item," select "Found," provide clear photos and location details, and submit. The system will automatically match it with lost item reports and notify potential owners.'
            },
            {
                question: 'Is there a fee to use the platform?',
                answer: 'No, our platform is completely free for all Zetech students and staff. We aim to reunite everyone with their belongings at no cost.'
            },
            {
                question: 'How long are items kept in the system?',
                answer: 'Lost and found items remain in the system for 30 days. After that, they are archived. You can contact the Lost & Found office to retrieve older items.'
            }
        ],
        security: [
            {
                question: 'How does the platform ensure privacy?',
                answer: 'We only share essential contact information between finders and owners. All personal data is encrypted and never sold to third parties. The security office verifies all claims before item release.'
            },
            {
                question: 'What happens with my personal information?',
                answer: 'Your data is stored securely on encrypted servers accessible only to authorized staff. You can delete your account anytime, which removes all associated data.'
            },
            {
                question: 'Can anyone see my contact details?',
                answer: 'No. Contact details are only shared when both parties agree to connect through our platform. The system never displays your information publicly.'
            }
        ],
        claims: [
            {
                question: 'What documents do I need to claim a lost item?',
                answer: 'Bring a valid ID, proof of purchase if available, and be prepared to answer security questions about the item. The verification process usually takes 5-10 minutes.'
            },
            {
                question: 'How do I claim a found item?',
                answer: 'When you find a matching item, click "Claim Item," answer verification questions, and provide proof of ownership. The security office will review and approve your claim.'
            },
            {
                question: 'What if someone else claims my item first?',
                answer: 'Our verification system prioritizes the true owner. If conflicting claims exist, the security office will verify ownership through questions only the real owner can answer correctly.'
            }
        ],
        notifications: [
            {
                question: 'Will I get notified when someone finds my item?',
                answer: 'Yes! If notification preferences are enabled, you\'ll receive an email or SMS when a matching item is found. Go to Settings > Notifications to customize your preferences.'
            },
            {
                question: 'How can I manage my notification settings?',
                answer: 'Visit Settings > Notification Settings to choose which notifications you want: item matches, status updates, new found items in your category, and claim confirmations.'
            },
            {
                question: 'Can I set custom notification keywords?',
                answer: 'Yes! In your notification settings, you can specify item categories, locations, or keywords to only receive alerts about items matching your criteria.'
            },
            {
                question: 'When are notifications sent?',
                answer: 'Notifications are sent immediately when a match is found. You can choose to receive them via email, SMS, or in-app notifications (based on your subscription).'
            }
        ]
    };

    return (
        <div className="min-h-screen py-16 px-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)' }}>
            <div className="max-w-5xl mx-auto">
                {/* Header with Logo */}
                <motion.div 
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                          className="p-3 rounded-full"
                          style={{
                            background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <img src="/zetech-logo.svg" alt="Zetech" className="h-8 w-8 object-contain" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold" style={{
                            background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            FAQs
                        </h1>
                    </div>
                    <motion.p 
                      className="text-lg text-slate-600 max-w-2xl mx-auto font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        Find answers to common questions about reporting and claiming items
                    </motion.p>
                </motion.div>

                {/* Category Tabs */}
                <motion.div 
                    className="flex flex-wrap justify-center gap-3 mb-12"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <motion.button
                                key={category.id}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    setExpandedItem(0);
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                                    activeCategory === category.id
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:border-green-300'
                                }`}
                            >
                                <Icon className="text-base" />
                                <span className="hidden sm:inline">{category.label}</span>
                            </motion.button>
                        );
                    })}
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {faqs[activeCategory].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="group"
                        >
                            <motion.button
                                onClick={() => setExpandedItem(expandedItem === index ? -1 : index)}
                                whileHover={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)' }}
                                className="w-full text-left p-5 bg-white rounded-xl shadow-sm transition-all duration-300"
                                style={{
                                    border: '1px solid rgba(16, 185, 129, 0.15)'
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3 items-start flex-grow">
                                        <div className="p-2 rounded-lg mt-0.5" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                                            <FaQuestion className="text-green-600 text-base" />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-green-600 transition-colors">
                                            {item.question}
                                        </h3>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedItem === index ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0"
                                    >
                                        <FaChevronDown className="text-green-600 text-base" />
                                    </motion.div>
                                </div>
                            </motion.button>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: expandedItem === index ? 'auto' : 0,
                                    opacity: expandedItem === index ? 1 : 0
                                }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 text-sm text-slate-700 rounded-b-xl border-t border-green-100">
                                    {item.answer}
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact CTA */}
                <motion.div 
                    className="mt-16 p-8 rounded-2xl text-white text-center overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{
                        background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.25)'
                    }}
                >
                    <div className="relative z-10">
                        <motion.h3 
                          className="text-2xl font-bold mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                            Didn't find your answer?
                        </motion.h3>
                        <motion.p 
                          className="mb-6 text-base text-green-50 font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 }}
                        >
                            Our support team is here to help you
                        </motion.p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.a 
                              href="/contact"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold text-base transition-all duration-300"
                            >
                                Contact Support
                            </motion.a>
                            <motion.a 
                              href="mailto:support@zetech.ac.ke"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-6 py-3 border-2 border-white text-white rounded-xl font-semibold text-base hover:bg-white/10 transition-all duration-300"
                            >
                                Email Us
                            </motion.a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Askqu;
