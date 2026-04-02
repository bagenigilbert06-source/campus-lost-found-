import React, { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { messagesService } from '../../services/apiService';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const [isSending, setIsSending] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.name || !formData.email || !formData.message) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'All fields are required!',
          position: 'top',
          toast: true,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        return;
      }

      setIsSending(true);
      try {
        const payload = {
          conversationId: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          itemId: 'contact',
          subject: `Contact form: ${formData.name}`,
          senderId: `public-${formData.email}`,
          senderEmail: formData.email.toLowerCase(),
          senderRole: 'student',
          recipientId: 'admin',
          recipientEmail: 'lost-and-found@zetech.ac.ke',
          recipientRole: 'admin',
          content: `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
        };

        try {
          await messagesService.sendContactMessage({name: formData.name, email: formData.email, subject: `Contact form: ${formData.name}`, message: formData.message});
        } catch (err) {
          if (err?.response?.status === 404) {
            await messagesService.sendMessage(payload);
          } else {
            throw err;
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'The Lost & Found office will respond shortly.',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setFormData({
          name: '',
          email: '',
          message: '',
        });
      } catch (error) {
        console.error('[Contact] send message failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Send Failed',
          text: error.response?.data?.message || 'Unable to send message right now. Please try again.',
          position: 'top',
          toast: true,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } finally {
        setIsSending(false);
      }
    },
    [formData]
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Helmet>
        <title>{`Contact Us - ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Hero */}
        <section className="mb-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-5 shadow-sm sm:mb-8 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                Contact Support
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                Contact Lost &amp; Found Office
              </h1>

              <p className="mt-2 text-sm leading-6 text-emerald-900/80 sm:text-base">
                Have questions, need help with a claim, or want support with a lost
                or found item? Reach out and our team will assist you as quickly as
                possible.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-200">
              <FaHeadset className="h-7 w-7" />
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            <InfoCard
              icon={FaMapMarkerAlt}
              title="Office Location"
              accent="emerald"
            >
              <p className="text-sm font-semibold text-slate-800">
                Administration Building, Ground Floor
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {schoolConfig.contact.address}
              </p>
            </InfoCard>

            <InfoCard icon={FaClock} title="Office Hours" accent="green">
              <p className="text-sm font-semibold text-slate-800">
                Monday - Friday: 8:00 AM - 5:00 PM
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Saturday: 9:00 AM - 1:00 PM
              </p>
            </InfoCard>

            <InfoCard icon={FaPhone} title="Phone &amp; Email" accent="emerald">
              <p className="text-sm font-semibold text-slate-800">
                {schoolConfig.contact.phone}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {schoolConfig.contact.email}
              </p>
            </InfoCard>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <FaEnvelope className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Quick Help
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    For urgent questions about claims, verification, or item
                    recovery, contact the Lost &amp; Found office during working
                    hours for faster support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Send us a Message
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Fill in the form below and our team will get back to you as soon as
                possible.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  placeholder="your.email@zetech.ac.ke"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  placeholder="Describe your inquiry..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold text-white ${isSending ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoCard({ icon: Icon, title, children, accent = 'emerald' }) {
  const accentStyles = {
    emerald: {
      iconWrap: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
    },
    green: {
      iconWrap: 'bg-green-50',
      iconColor: 'text-green-700',
    },
    blue: {
      iconWrap: 'bg-blue-50',
      iconColor: 'text-blue-700',
    },
    slate: {
      iconWrap: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
  };

  const styles = accentStyles[accent] || accentStyles.emerald;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap} ${styles.iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Contact;