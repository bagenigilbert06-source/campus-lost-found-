import React from "react";
import { FaBullseye, FaHandshake, FaHeart, FaEnvelope, FaSearch, FaShieldAlt, FaUniversity } from "react-icons/fa";
import { Link } from "react-router-dom";
import { schoolConfig } from "../../config/schoolConfig";
import { Helmet } from "react-helmet-async";

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
      <Helmet>
        <title>About Us - {schoolConfig.name} Lost & Found</title>
      </Helmet>

      {/* Hero Section */}
      <section className="text-center mb-20">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-zetech-primary rounded-full flex items-center justify-center">
            <FaUniversity className="text-3xl text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-zetech-primary">
          About {schoolConfig.name} Lost & Found
        </h1>
        <p className="text-base font-medium text-gray-600 max-w-3xl mx-auto leading-relaxed">
          The official lost and found portal for {schoolConfig.name}, helping our campus community
          reconnect with their belongings through
          <span className="font-semibold text-zetech-primary"> student collaboration</span> and
          <span className="font-semibold text-zetech-primary"> efficient systems</span>.
        </p>
      </section>

      {/* Mission Section */}
      <section className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
          <div className="flex items-center mb-4">
            <FaBullseye className="text-xl text-zetech-primary mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Our Mission</h2>
          </div>
          <p className="text-gray-600 text-sm leading-7">
            To ensure no item stays lost on {schoolConfig.shortName} campus. We connect finders with owners
            through a streamlined digital system that makes reporting and claiming items
            <span className="text-zetech-primary font-medium"> quick, secure, and hassle-free</span>.
          </p>
        </div>

        <div className="bg-zetech-primary rounded-2xl p-8 shadow-lg text-white">
          <div className="flex items-center mb-4">
            <FaHandshake className="text-xl text-zetech-secondary mr-3" />
            <h2 className="text-xl font-semibold">Our Promise</h2>
          </div>
          <p className="leading-7 text-sm opacity-90">
            Every claim is handled with care. We use a
            <span className="font-medium text-zetech-secondary"> verification system</span> to ensure items
            are returned to their rightful owners, maintaining trust and integrity across campus.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white rounded-2xl shadow-xl p-10 mb-20">
        <h2 className="text-xl font-bold mb-12 text-center text-gray-800">
          <FaSearch className="inline-block mr-3 text-zetech-primary" />
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FaSearch, title: "Report", text: "Post details with photos and the campus location where you lost/found the item" },
            { icon: FaShieldAlt, title: "Verify", text: "Security officers review claims and verify ownership before release" },
            { icon: FaHeart, title: "Reunite", text: "Collect your item from the Lost & Found office with verification" }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 hover:bg-zetech-light rounded-xl transition-all">
              <item.icon className="text-2xl text-zetech-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Locations */}
      <section className="mb-20">
        <div className="bg-zetech-light rounded-2xl p-10 shadow-lg">
          <h2 className="text-xl font-bold mb-8 text-zetech-primary">Campus Collection Points</h2>
          <p className="text-gray-600 mb-6">Found items can be dropped off or collected at these locations:</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {schoolConfig.locations.slice(0, 8).map((location, index) => (
              <div key={index} className="p-3 bg-white rounded-lg shadow-sm text-center">
                <span className="text-sm font-medium text-gray-700">{location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <div className="bg-zetech-primary rounded-2xl p-10 text-white shadow-xl">
          <h2 className="text-xl font-bold mb-8">Our Core Values</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Integrity", text: "Honest reporting and verified claims only" },
              { title: "Community", text: "Students helping students across campus" },
              { title: "Security", text: "Protected data and secure verification process" }
            ].map((value, index) => (
              <div key={index} className="p-4 bg-white bg-opacity-10 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 text-zetech-secondary">{value.title}</h3>
                <p className="opacity-90 text-sm">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white rounded-2xl shadow-xl p-10">
        <div className="text-center">
          <FaEnvelope className="text-3xl text-zetech-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Need Help?</h2>
          <p className="text-sm text-gray-600 mb-2">Lost & Found Office: {schoolConfig.contact.phone}</p>
          <p className="text-sm text-gray-600 mb-6">Email: {schoolConfig.contact.email}</p>
          <Link to="/contact" className="inline-block bg-zetech-primary text-white px-6 py-3 rounded-lg hover:bg-zetech-accent transition-colors shadow-lg">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
