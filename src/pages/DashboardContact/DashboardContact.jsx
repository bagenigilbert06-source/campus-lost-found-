import React, { useState, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import AuthContext from '../../context/Authcontext/AuthContext';
import { messagesService } from '../../services/apiService';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
  FaQuestionCircle,
  FaArrowRight,
} from 'react-icons/fa';

const DashboardContact = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    subject: '',
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

      if (!formData.subject || !formData.message) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Please fill in all fields!',
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
        if (!user?.email) {
          throw new Error('User must be logged in to contact support.');
        }

        const payload = {
          conversationId: `contact-${user.uid}-${Date.now()}`,
          itemId: 'contact',
          subject: formData.subject,
          senderId: user.uid,
          senderEmail: user.email,
          senderRole: user.role || 'student',
          recipientId: 'admin',
          recipientEmail: 'lost-and-found@zetech.ac.ke',
          recipientRole: 'admin',
          content: formData.message,
        };

        try {
          await messagesService.sendContactMessage({
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            subject: formData.subject,
            message: formData.message,
          });
        } catch (innerErr) {
          if (innerErr?.response?.status === 404) {
            await messagesService.sendMessage(payload);
          } else {
            throw innerErr;
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'The Lost & Found office will respond to your inquiry shortly.',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setFormData({ subject: '', message: '' });
      } catch (error) {
        console.error('[DashboardContact] send message failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Send Failed',
          text: error.response?.data?.message || error.message || 'Unable to send message right now. Please try again.',
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
    [formData, user]
  );

  return (
    <>
      <Helmet>
        <title>{`Contact Support - ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Contact Support
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Need help with a claim, have questions, or want to report an issue? Reach out to our Lost & Found office.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Information Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Contact Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <FaHeadset className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Office Contact</h3>
            </div>

            <div className="space-y-4">
              {/* Phone */}
              <div className="flex gap-3">
                <FaPhone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="text-sm font-semibold text-slate-900">{schoolConfig.contact.phone}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3">
                <FaEnvelope className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                  <p className="text-sm font-semibold text-slate-900">{schoolConfig.contact.email}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-3">
                <FaMapMarkerAlt className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-900">Admin Building, Ground Floor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FaClock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Office Hours</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Mon - Fri</span>
                <span className="font-semibold text-slate-900">8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Saturday</span>
                <span className="font-semibold text-slate-900">9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sunday</span>
                <span className="font-semibold text-slate-900">Closed</span>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <FaQuestionCircle className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-950">Quick Tip</h4>
                <p className="mt-1 text-sm text-emerald-800">
                  Most common questions are answered in our FAQ section. Check it out first!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the form below and our support team will get back to you as soon as possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Your Info (Pre-filled) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Your Information</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={user?.displayName || user?.email?.split('@')[0] || ''}
                    disabled
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                required
              >
                <option value="">Select a subject...</option>
                <option value="claim-issue">Claim Issue</option>
                <option value="item-not-found">Item Not Found</option>
                <option value="claim-status">Check Claim Status</option>
                <option value="general-inquiry">General Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
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
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Please describe your inquiry in detail..."
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className={`inline-flex items-center justify-center gap-2 w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-colors ${isSending ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              <FaArrowRight className="h-4 w-4" />
              {isSending ? 'Sending…' : 'Send Message'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              We typically respond to inquiries within 24 hours during business days.
            </p>
          </form>
        </div>
      </div>

      {/* Important Info Box */}
      <div className="mt-8 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-950 mb-2">For Urgent Matters</h3>
        <p className="text-sm text-amber-800">
          If your issue is urgent, we recommend visiting the office in person or calling directly at{' '}
          <span className="font-semibold">{schoolConfig.contact.phone}</span> during office hours.
        </p>
      </div>
    </>
  );
};

export default DashboardContact;
