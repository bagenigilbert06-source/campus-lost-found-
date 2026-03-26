import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaBox, FaClipboard, FaEnvelope, FaSignOutAlt, FaUser, FaSearch, FaPlus } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * StudentDashboard - Student-only dashboard
 * Protected by StudentRoute - only accessible to authenticated students
 * Admins are redirected to /admin by the StudentRoute guard
 */
const StudentDashboard = () => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    itemsReported: 0,
    itemsRecovered: 0,
    activeReports: 0,
  });
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        
        // Fetch user's items from API
        const response = await axios.get(`${API_URL}/items`, {
          params: { email: user.email }
        });
        
        const items = Array.isArray(response.data) ? response.data : response.data?.data || [];
        const userItems = items.filter(item => item.email === user.email);
        
        setMyItems(userItems.slice(0, 5)); // Show latest 5
        
        // Calculate stats
        const recovered = userItems.filter(item => item.status === 'recovered').length;
        const active = userItems.filter(item => item.status !== 'recovered').length;
        
        setUserStats({
          itemsReported: userItems.length,
          itemsRecovered: recovered,
          activeReports: active,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Use placeholder stats on error
        setUserStats({
          itemsReported: 0,
          itemsRecovered: 0,
          activeReports: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        toast.success('Signed out successfully');
        navigate('/signin');
      })
      .catch((error) => {
        toast.error('Error signing out');
        console.error('Sign out error:', error);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.displayName || 'Student'}
          </h2>
          <p className="text-gray-600">
            Use this portal to report lost items, search for found items, and track your submissions.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<FaBox className="text-2xl" />}
            title="Items Reported"
            value={loading ? '...' : userStats.itemsReported}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FaClipboard className="text-2xl" />}
            title="Active Reports"
            value={loading ? '...' : userStats.activeReports}
            color="bg-amber-500"
          />
          <StatCard
            icon={<FaUser className="text-2xl" />}
            title="Items Recovered"
            value={loading ? '...' : userStats.itemsRecovered}
            color="bg-green-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Search Items"
              description="Browse all lost and found items on campus"
              icon={<FaSearch className="text-3xl" />}
              link="/search"
              buttonText="Search Now"
            />
            <ActionCard
              title="Report Item"
              description="Report a lost or found item"
              icon={<FaPlus className="text-3xl" />}
              link="/addItems"
              buttonText="Report Item"
            />
            <ActionCard
              title="My Items"
              description="View and manage your reported items"
              icon={<FaClipboard className="text-3xl" />}
              link="/myItems"
              buttonText="View My Items"
            />
          </div>
        </div>

        {/* Recent Items */}
        {myItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">My Recent Reports</h3>
              <Link to="/myItems" className="text-teal-600 hover:underline text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {myItems.map(item => (
                <Link 
                  key={item._id} 
                  to={`/items/${item._id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaBox />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.postType === 'Lost' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.postType}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step="1"
              title="Report"
              description="Lost something? Report it with details and photos to help others identify it"
            />
            <StepCard
              step="2"
              title="Search"
              description="Found something? Search our database to see if the owner has reported it"
            />
            <StepCard
              step="3"
              title="Connect"
              description="When a match is found, connect with the security office to verify and collect"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need Help?</h3>
          <p className="mb-4">
            Contact the Lost & Found office for assistance with your items or reports.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/contact"
              className="px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Contact Office
            </Link>
            <Link 
              to="/directory"
              className="px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              Campus Directory
            </Link>
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
