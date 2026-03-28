<<<<<<< HEAD
import React, { useState, useMemo, useCallback } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
import Swal from 'sweetalert2';
import Lottie from 'react-lottie';
import { Helmet } from 'react-helmet-async';
import animationData from '../../assets/contact.json';
import { schoolConfig } from '../../config/schoolConfig';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Contact = () => {
<<<<<<< HEAD
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

  const handleSubmit = useCallback(
    (e) => {
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
    },
    [formData]
  );

  const lottieOptions = useMemo(
    () => ({
      loop: true,
      autoplay: true,
      animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zetech-light via-white to-emerald-50/40">
      <Helmet>
        <title>{`Contact Us - ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 py-10 md:py-14">
        {/* Header / Intro */}
        <div className="mx-auto max-w-6xl mb-10 md:mb-14">
          <div className="rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur-sm shadow-[0_10px_40px_rgba(16,185,129,0.08)] px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-shrink-0">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100/70 p-3 shadow-inner">
                  <Lottie options={lottieOptions} height={140} width={140} />
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 mb-4">
                  Contact Support
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-zetech-primary leading-tight mb-3">
                  Contact Lost &amp; Found Office
                </h2>

                <p className="text-sm md:text-base font-medium text-gray-600 max-w-2xl leading-7">
                  Have questions, need help with a claim, or want support with a lost or found item?
                  Reach out to our office and we&apos;ll assist you as quickly as possible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-5">
            <div className="group bg-white p-7 md:p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-emerald-100/80 text-zetech-primary shadow-sm">
                  <FaMapMarkerAlt className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">Office Location</h3>
                  <p className="text-gray-700 text-sm font-semibold leading-relaxed">
                    Administration Building, Ground Floor
                  </p>
                  <p className="text-gray-600 text-sm leading-7 mt-1">
                    {schoolConfig.contact.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white p-7 md:p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-green-100/80 text-green-700 shadow-sm">
                  <FaClock className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">Office Hours</h3>
                  <p className="text-gray-700 text-sm font-semibold leading-relaxed">
                    Monday - Friday: 8:00 AM - 5:00 PM
                  </p>
                  <p className="text-gray-600 text-sm leading-7 mt-1">
                    Saturday: 9:00 AM - 1:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-white p-7 md:p-8 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-emerald-100/80 text-emerald-700 shadow-sm">
                  <FaPhone className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800 mb-2">Phone &amp; Email</h3>
                  <p className="text-gray-700 text-sm font-semibold leading-relaxed">
                    {schoolConfig.contact.phone}
                  </p>
                  <p className="text-gray-600 text-sm leading-7 mt-1">
                    {schoolConfig.contact.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-r from-zetech-primary to-emerald-600 rounded-2xl p-7 md:p-8 text-white shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3.5 rounded-xl bg-white/15 text-white">
                  <FaEnvelope className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold mb-2">Quick Help</h3>
                  <p className="text-sm leading-7 text-emerald-50">
                    For urgent questions about claims, verification, or item recovery,
                    contact the Lost &amp; Found office during working hours for immediate support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-[0_10px_40px_rgba(16,185,129,0.08)] p-7 md:p-8 lg:p-9">
            <div className="mb-6">
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Send us a Message</h3>
              <p className="text-gray-600 text-sm leading-7">
                Fill in the form below and our team will get back to you as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-emerald-100 rounded-xl bg-emerald-50/40 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 focus:bg-white transition-colors duration-200"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-emerald-100 rounded-xl bg-emerald-50/40 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 focus:bg-white transition-colors duration-200"
                  placeholder="your.email@zetech.ac.ke"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-bold text-gray-800 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3.5 border border-emerald-100 rounded-xl bg-emerald-50/40 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 focus:bg-white transition-colors duration-200 resize-none"
                  placeholder="Describe your inquiry..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl px-6 py-3.5 text-white font-extrabold tracking-wide transition-all duration-200 hover:brightness-105 active:scale-[0.99] shadow-[0_10px_25px_rgba(16,185,129,0.22)]"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 55%, #34d399 100%)',
                  border: '1px solid rgba(16,185,129,0.35)',
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
=======
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
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
    };

    const lottieOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zetech-light">
            <Helmet>
                <title>{`Contact Us - ${schoolConfig.name} Lost & Found`}</title>
            </Helmet>
            <div className="container px-6 py-12">
                {/* Contact Section */}
                <div className="flex items-center justify-center mb-8">
                    <div className="mr-6">
                        <Lottie options={lottieOptions} height={150} width={150} />
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-zetech-primary mb-4">Contact Lost & Found Office</h2>
                        <p className="text-sm font-semibold text-gray-600">Have questions? Need help with a claim? Reach out to us!</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info Cards */}
                    <div className="space-y-5">
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-zetech-primary hover:border-l-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 p-3 bg-zetech-primary/10 rounded-lg">
                                    <FaMapMarkerAlt className="text-zetech-primary text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Office Location</h3>
                            </div>
                            <p className="text-gray-700 text-sm font-medium leading-relaxed ml-0">Administration Building, Ground Floor</p>
                            <p className="text-gray-600 text-sm leading-relaxed ml-0 mt-1">{schoolConfig.contact.address}</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-zetech-secondary hover:border-l-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 p-3 bg-zetech-secondary/10 rounded-lg">
                                    <FaClock className="text-zetech-secondary text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Office Hours</h3>
                            </div>
                            <p className="text-gray-700 text-sm font-medium leading-relaxed">Monday - Friday: 8:00 AM - 5:00 PM</p>
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">Saturday: 9:00 AM - 1:00 PM</p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-zetech-accent hover:border-l-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-shrink-0 p-3 bg-zetech-accent/10 rounded-lg">
                                    <FaPhone className="text-zetech-accent text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">Phone & Email</h3>
                            </div>
                            <p className="text-gray-700 text-sm font-medium leading-relaxed">{schoolConfig.contact.phone}</p>
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">{schoolConfig.contact.email}</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Send us a Message</h3>
                        <p className="text-gray-600 text-sm mb-6">We'll get back to you as soon as possible.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent focus:bg-white transition-all"
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent focus:bg-white transition-all"
                                    placeholder="your.email@zetech.ac.ke"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-zetech-primary focus:border-transparent focus:bg-white transition-all resize-none"
                                    placeholder="Describe your inquiry..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full font-bold py-3 px-6 rounded-2xl text-white transition-all duration-300"
                                style={{
                                    background: 'rgba(16, 185, 129, 0.3)',
                                    backdropFilter: 'blur(30px)',
                                    WebkitBackdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                    letterSpacing: '0.5px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(16, 185, 129, 0.45)';
                                    e.target.style.borderColor = 'rgba(16, 185, 129, 0.55)';
                                    e.target.style.boxShadow = '0 8px 28px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(16, 185, 129, 0.3)';
                                    e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                                    e.target.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                onMouseDown={(e) => {
                                    e.target.style.background = 'rgba(16, 185, 129, 0.35)';
                                    e.target.style.boxShadow = '0 2px 10px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                                onMouseUp={(e) => {
                                    e.target.style.background = 'rgba(16, 185, 129, 0.45)';
                                    e.target.style.boxShadow = '0 8px 28px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
>>>>>>> 9c6a2abaae33a2f4aff6f73fabb000acc11acafe
