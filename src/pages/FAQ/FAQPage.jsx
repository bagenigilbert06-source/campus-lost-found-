import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  FaChevronDown,
  FaShieldAlt,
  FaUserCheck,
  FaBell,
  FaQuestion,
  FaCompass,
} from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const FAQPage = memo(function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedItem, setExpandedItem] = useState(0);

  const categories = useMemo(
    () => [
      { id: 'general', label: 'Getting Started', icon: FaCompass },
      { id: 'security', label: 'Security & Privacy', icon: FaShieldAlt },
      { id: 'claims', label: 'Claiming Items', icon: FaUserCheck },
      { id: 'notifications', label: 'Notifications', icon: FaBell },
    ],
    []
  );

  const faqs = useMemo(
    () => ({
      general: [
        {
          question: 'How do I report a lost item?',
          answer:
            'Sign in to your account, click "Report Item," select "Lost," and fill out the form with detailed descriptions, photos, location, and date. The security office will verify your report within 24 hours.',
        },
        {
          question: 'What should I do if I find an item?',
          answer:
            'Click "Report Item," select "Found," provide clear photos and location details, and submit. The system will automatically match it with lost item reports and notify potential owners.',
        },
        {
          question: 'Is there a fee to use the platform?',
          answer:
            'No, our platform is completely free for all Zetech students and staff. We aim to reunite everyone with their belongings at no cost.',
        },
        {
          question: 'How long are items kept in the system?',
          answer:
            'Lost and found items remain in the system for 30 days. After that, they are archived. You can contact the Lost & Found office to retrieve older items.',
        },
      ],
      security: [
        {
          question: 'How does the platform ensure privacy?',
          answer:
            'We only share essential contact information between finders and owners. All personal data is encrypted and never sold to third parties. The security office verifies all claims before item release.',
        },
        {
          question: 'What happens with my personal information?',
          answer:
            'Your data is stored securely on encrypted servers accessible only to authorized staff. You can delete your account anytime, which removes all associated data.',
        },
        {
          question: 'Can anyone see my contact details?',
          answer:
            'No. Contact details are only shared when both parties agree to connect through our platform. The system never displays your information publicly.',
        },
      ],
      claims: [
        {
          question: 'What documents do I need to claim a lost item?',
          answer:
            'Bring a valid ID, proof of purchase if available, and be prepared to answer security questions about the item. The verification process usually takes 5–10 minutes.',
        },
        {
          question: 'How do I claim a found item?',
          answer:
            'When you find a matching item, click "Claim Item," answer verification questions, and provide proof of ownership. The security office will review and approve your claim.',
        },
        {
          question: 'What if someone else claims my item first?',
          answer:
            'Our verification system prioritizes the true owner. If conflicting claims exist, the security office will verify ownership through questions only the real owner can answer correctly.',
        },
      ],
      notifications: [
        {
          question: 'Will I get notified when someone finds my item?',
          answer:
            "Yes. If notification preferences are enabled, you'll receive an email or SMS when a matching item is found. Go to Settings > Notifications to customize your preferences.",
        },
        {
          question: 'How can I manage my notification settings?',
          answer:
            'Visit Settings > Notification Settings to choose which notifications you want, including item matches, status updates, new found items in your category, and claim confirmations.',
        },
        {
          question: 'Can I set custom notification keywords?',
          answer:
            'Yes. In your notification settings, you can specify item categories, locations, or keywords to only receive alerts about items matching your criteria.',
        },
        {
          question: 'When are notifications sent?',
          answer:
            'Notifications are sent immediately when a match is found. You can choose to receive them via email, SMS, or in-app notifications depending on your available preferences.',
        },
      ],
    }),
    []
  );

  const currentFaqs = faqs[activeCategory] || [];

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
    setExpandedItem(0);
  }, []);

  const handleToggle = useCallback((index) => {
    setExpandedItem((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>{`FAQ - ${schoolConfig.name} Lost & Found`}</title>
        <meta
          name="description"
          content="Frequently asked questions about Zetech Lost & Found. Find answers about reporting items, security, claiming items, and notifications."
        />
      </Helmet>

      {/* Hero / Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 px-4 py-16 md:px-6 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 md:text-sm">
              Help Center
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Frequently Asked Questions
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-50/90 md:text-lg">
              Everything you need to know about reporting, finding, claiming,
              and managing items on our lost and found platform.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2.5 md:mb-10 md:gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 md:px-5 ${
                    isActive
                      ? 'border border-emerald-600 bg-emerald-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Items */}
          <div className="space-y-3">
            {currentFaqs.map((item, index) => {
              const isOpen = expandedItem === index;

              return (
                <article
                  key={`${activeCategory}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors duration-200 hover:bg-slate-50 md:px-6"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <FaQuestion className="text-sm" />
                      </div>

                      <h3 className="text-base font-semibold leading-6 text-slate-900 md:text-lg">
                        {item.question}
                      </h3>
                    </div>

                    <div
                      className={`mt-1 shrink-0 text-emerald-600 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    >
                      <FaChevronDown className="text-base" />
                    </div>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 md:px-6">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-3xl bg-emerald-600 px-6 py-10 text-center text-white sm:px-8 md:px-10 md:py-12">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              Didn&apos;t find your answer?
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
              Our support team is here to help with any questions about lost
              items, claims, privacy, or account support.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-emerald-700 transition-colors duration-200 hover:bg-emerald-50"
              >
                Contact Support
              </a>

              <a
                href="mailto:support@zetech.ac.ke"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/70 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default FAQPage;