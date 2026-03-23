import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Lottie from 'react-lottie';
import { Helmet } from 'react-helmet-async';
import animationData from '../../assets/contact.json';
import { schoolConfig } from '../../config/schoolConfig';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Contact = () => {
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
                <title>Contact Us - {schoolConfig.name} Lost & Found</title>
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
