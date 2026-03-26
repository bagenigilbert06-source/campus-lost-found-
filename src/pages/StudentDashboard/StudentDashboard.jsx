import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaBox, FaClipboard, FaEnvelope, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    claimsSubmitted: 0,
    claimsApproved: 0,
    itemsFound: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Fetch user statistics
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        // Placeholder - replace with actual API calls
        setUserStats({
          claimsSubmitted: 2,
          claimsApproved: 1,
          itemsFound: 0,
          unreadMessages: 3,
        });
      } catch (error) {
        console.error('[v0] Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, navigate]);

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        toast.success('Signed out successfully');
        navigate('/signin');
      })
      .catch((error) => {
        toast.error('Error signing out');
        console.error('[v0] Sign out error:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Helmet>
        <title>Student Dashboard - {schoolConfig.name}</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{schoolConfig.shortName}</h1>
            <p className="text-sm text-gray-600">Student Portal - Lost & Found</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.displayName || 'Student'}</h2>
          <p className="text-gray-600">
            Use this portal to search for lost items, track your claims, and communicate with the Lost & Found office.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FaBox className="text-2xl" />}
            title="Claims Submitted"
            value={userStats.claimsSubmitted}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FaClipboard className="text-2xl" />}
            title="Claims Approved"
            value={userStats.claimsApproved}
            color="bg-green-500"
          />
          <StatCard
            icon={<FaUser className="text-2xl" />}
            title="Items Found"
            value={userStats.itemsFound}
            color="bg-purple-500"
          />
          <StatCard
            icon={<FaEnvelope className="text-2xl" />}
            title="Unread Messages"
            value={userStats.unreadMessages}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Search Lost Items"
              description="Browse all items found on campus"
              icon={<FaBox className="text-3xl" />}
              link="/search"
              buttonText="Search Now"
            />
            <ActionCard
              title="My Claims"
              description="Track items you've claimed"
              icon={<FaClipboard className="text-3xl" />}
              link="/my-claims"
              buttonText="View Claims"
            />
            <ActionCard
              title="Messages"
              description="Chat with Lost & Found office"
              icon={<FaEnvelope className="text-3xl" />}
              link="/messages"
              buttonText="Check Messages"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step="1"
              title="Search"
              description="Browse the collection of lost and found items on campus"
            />
            <StepCard
              step="2"
              title="Claim"
              description="Found your item? Click 'Claim Item' to initiate the verification process"
            />
            <StepCard
              step="3"
              title="Verify & Collect"
              description="Chat with office staff to verify ownership and arrange pickup"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need Help?</h3>
          <p className="mb-4">
            Contact the Lost & Found office for assistance with your claims or to report a lost item.
          </p>
          <div className="flex gap-4">
            <a href={`mailto:${schoolConfig.contactEmail}`} className="px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Email Office
            </a>
            <a href={`tel:${schoolConfig.contactPhone}`} className="px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Call Office
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-gray-200 hover:shadow-lg transition">
    <div className={`${color} text-white p-3 rounded-lg w-fit mb-3`}>
      {icon}
    </div>
    <h3 className="text-gray-600 text-sm font-semibold mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

// Action Card Component
const ActionCard = ({ title, description, icon, link, buttonText }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border-l-4 border-teal-400 hover:shadow-lg transition">
    <div className="mb-4">
      <div className="text-teal-500 mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
    <Link
      to={link}
      className="inline-block px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition text-center"
    >
      {buttonText}
    </Link>
  </div>
);

// Step Card Component
const StepCard = ({ step, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-4">
      {step}
    </div>
    <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default StudentDashboard;
