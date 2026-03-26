import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const LostFoundGuide = () => {
  const [expandedFaqs, setExpandedFaqs] = useState({});

  const faqs = [
    {
      id: 1,
      question: "How do I report a lost item?",
      answer: "Click on 'Add Item' in the navigation, select 'Lost' as the item type, upload clear photos of the item, fill in the details (title, description, category, location where lost, and date), then submit. Your item will appear in the Lost & Found list and admins will verify it."
    },
    {
      id: 2,
      question: "How do I report finding an item?",
      answer: "Go to 'Add Item', select 'Found' as the type, upload photos of the item with clear details, specify where you found it, and submit. This helps the owner locate their item faster."
    },
    {
      id: 3,
      question: "Can I search for specific items?",
      answer: "Yes! Use the search bar to find items by title, location, or category. You can also use the advanced filters to narrow down by item type (Lost/Found), location, verification status, and date range."
    },
    {
      id: 4,
      question: "What does 'Verified' mean?",
      answer: "Items marked as 'Verified' have been checked and confirmed by the security office. Pending items are awaiting verification. Verified items are more reliable and have been authenticated by the campus authorities."
    },
    {
      id: 5,
      question: "How do I claim an item I found?",
      answer: "Click 'View Details' on an item, then click 'This is Mine!' (for found items) or 'Found This!' (for lost items). Fill in the recovery details including location and date, then submit. The owner will be notified."
    },
    {
      id: 6,
      question: "Can I upload multiple photos?",
      answer: "Yes! When adding an item, you can add multiple image URLs. Click the 'Add' button to include each photo. More images help others identify the item better."
    },
    {
      id: 7,
      question: "How long are items listed?",
      answer: "Items remain listed until they are marked as 'Recovered' or 'Claimed'. Once recovered, they move to the recovered items section. You can delete your own posts anytime from 'My Items'."
    },
    {
      id: 8,
      question: "What information should I include?",
      answer: "Include a clear description with details like color, brand, condition, distinguishing marks, exact location lost/found, and date. The more details, the better chance of finding the owner or locating your item."
    }
  ];

  const features = [
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Search by title, location, category, or description with instant results'
    },
    {
      icon: '🏷️',
      title: 'Category Filter',
      description: 'Browse by Electronics, Documents, Accessories, Clothing, Books, and more'
    },
    {
      icon: '📍',
      title: 'Location Tracking',
      description: 'Filter items by specific campus locations for quick recovery'
    },
    {
      icon: '✅',
      title: 'Verification System',
      description: 'Trust verified items authenticated by campus security'
    },
    {
      icon: '📸',
      title: 'Multiple Photos',
      description: 'Upload multiple images for better item identification'
    },
    {
      icon: '📅',
      title: 'Date Filtering',
      description: 'Find items lost or found within specific date ranges'
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full">
      {/* Features Section */}
      <section className="py-8 px-4 md:px-0">
        <h2 className="text-3xl font-bold text-zetech-primary mb-8 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 border border-green-200 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg text-zetech-primary mb-2">{feature.title}</h3>
              <p className="text-gray-700 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 md:px-0">
        <h2 className="text-3xl font-bold text-zetech-primary mb-8 text-center flex items-center justify-center gap-2">
          <FaQuestionCircle /> Frequently Asked Questions
        </h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <motion.div
              key={faq.id}
              className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left"
              >
                <span className="font-semibold text-zetech-primary">{faq.question}</span>
                {expandedFaqs[faq.id] ? (
                  <FaChevronUp className="text-zetech-primary" />
                ) : (
                  <FaChevronDown className="text-zetech-primary" />
                )}
              </button>
              {expandedFaqs[faq.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4 bg-slate-50 border-t border-slate-200"
                >
                  <p className="text-gray-700">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-8 px-4 md:px-0 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold text-zetech-primary mb-6 text-center">💡 Tips for Success</h3>
        <ul className="max-w-3xl mx-auto space-y-3 list-disc list-inside text-gray-700">
          <li><strong>Be Specific:</strong> Include unique details that only the owner would know</li>
          <li><strong>Clear Photos:</strong> Take well-lit, clear photos from multiple angles</li>
          <li><strong>Quick Action:</strong> Post lost items immediately while they're still being looked for</li>
          <li><strong>Contact Info:</strong> Keep your email and phone updated in your profile</li>
          <li><strong>Review Matches:</strong> Check the platform regularly for matches to your items</li>
          <li><strong>Meet Safely:</strong> Always meet in public campus locations to exchange items</li>
        </ul>
      </section>
    </div>
  );
};

export default LostFoundGuide;
