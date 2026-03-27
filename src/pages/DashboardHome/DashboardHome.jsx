import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaBox, FaCheckCircle, FaHourglass, FaSearch, FaPlus, FaEye, FaTimes, FaComments, FaHistory } from 'react-icons/fa';

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    itemsPosted: 0,
    claimsSubmitted: 0,
    claimsApproved: 0,
    claimsPending: 0,
    itemsRecovered: 0,
    unreadMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickLinks] = useState([
    {
      title: 'Search for Items',
      description: 'Find lost or found items on campus',
      path: '/app/search',
      icon: FaSearch,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Post Lost Item',
      description: 'Report a lost item and help find it',
      path: '/app/post-lost-item',
      icon: FaPlus,
      color: 'bg-teal-50 text-teal-600'
    },
    {
      title: 'Post Found Item',
      description: 'Share a found item with the community',
      path: '/app/post-item',
      icon: FaBox,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'My Items',
      description: 'Manage your postings',
      path: '/app/my-items',
      icon: FaEye,
      color: 'bg-purple-50 text-purple-600'
    },
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user stats
      const [claimsRes, itemsRes, messagesRes] = await Promise.all([
        axios.get('http://localhost:3001/api/claims', {
          params: { studentEmail: user?.email },
          withCredentials: true
        }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/items', {
          params: { userEmail: user?.email },
          withCredentials: true
        }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/messages', {
          params: { recipientEmail: user?.email },
          withCredentials: true
        }).catch(() => ({ data: [] }))
      ]);

      const claimsData = Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data?.data || [];
      const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data?.data || [];
      const messagesData = Array.isArray(messagesRes.data) ? messagesRes.data : messagesRes.data?.data || [];

      const approved = claimsData.filter(c => c.status === 'approved').length;
      const pending = claimsData.filter(c => c.status === 'pending').length;
      const recovered = itemsData.filter(i => i.status === 'recovered').length;
      const unread = messagesData.filter(m => !m.isRead).length;

      setStats({
        itemsPosted: itemsData.length,
        claimsSubmitted: claimsData.length,
        claimsApproved: approved,
        claimsPending: pending,
        itemsRecovered: recovered,
        unreadMessages: unread,
      });

      // Get recent activity (last 5 items/claims)
      const activity = [
        ...itemsData.slice(0, 3).map(item => ({
          type: 'item',
          title: item.title,
          description: `Posted ${item.itemType}`,
          date: item.createdAt,
          icon: FaBox
        })),
        ...claimsData.slice(0, 2).map(claim => ({
          type: 'claim',
          title: claim.itemTitle,
          description: `Claim ${claim.status}`,
          date: claim.createdAt,
          icon: FaCheckCircle
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('[v0] Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon: Icon, accentColor, link }) => (
    <Link
      to={link}
      className="bg-white p-6 rounded-xl border border-gray-100 transition hover:shadow-md hover:border-gray-200 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-4xl font-bold mt-3 ${accentColor}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${accentColor} opacity-10`}>
          <Icon className={`w-8 h-8 ${accentColor}`} />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`Dashboard - ${schoolConfig.name}`}</title>
      </Helmet>

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.displayName || 'Student'}!
        </h1>
        <p className="text-gray-600">
          Here's your campus lost and found activity at a glance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Items Posted"
          value={stats.itemsPosted}
          icon={FaBox}
          accentColor="text-teal-600"
          link="/app/my-items"
        />
        <StatCard
          label="Claims Submitted"
          value={stats.claimsSubmitted}
          icon={FaCheckCircle}
          accentColor="text-emerald-600"
          link="/app/dashboard"
        />
        <StatCard
          label="Awaiting Review"
          value={stats.claimsPending}
          icon={FaHourglass}
          accentColor="text-amber-600"
          link="/app/dashboard"
        />
        <StatCard
          label="Approved Claims"
          value={stats.claimsApproved}
          icon={FaCheckCircle}
          accentColor="text-green-600"
          link="/app/dashboard"
        />
        <StatCard
          label="Items Recovered"
          value={stats.itemsRecovered}
          icon={FaEye}
          accentColor="text-cyan-600"
          link="/app/recovered"
        />
        <StatCard
          label="New Messages"
          value={stats.unreadMessages}
          icon={FaComments}
          accentColor="text-blue-600"
          link="/app/messages"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition group"
              >
                <div className="p-3 rounded-lg bg-teal-50 w-fit mb-3 group-hover:bg-teal-100 transition">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
                >
                  <div className="p-2.5 rounded-lg bg-teal-50">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {activity.date ? new Date(activity.date).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <div className="p-3 rounded-lg bg-gray-100 w-fit mx-auto mb-4">
              <FaHistory className="w-12 h-12 text-gray-400 opacity-60" />
            </div>
            <p className="text-gray-600 mb-4">No recent activity yet. Start by posting or searching for items!</p>
            <Link
              to="/app/search"
              className="inline-block px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
            >
              Browse Items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
