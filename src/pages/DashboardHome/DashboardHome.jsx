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

  const StatCard = ({ label, value, icon: Icon, color, link }) => (
    <Link
      to={link}
      className={`p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition hover:shadow-lg ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-20" />
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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.displayName || 'Student'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your campus lost and found activity at a glance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Items Posted"
          value={stats.itemsPosted}
          icon={FaBox}
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          link="/app/my-items"
        />
        <StatCard
          label="Claims Submitted"
          value={stats.claimsSubmitted}
          icon={FaCheckCircle}
          color="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
          link="/app/dashboard"
        />
        <StatCard
          label="Awaiting Review"
          value={stats.claimsPending}
          icon={FaHourglass}
          color="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
          link="/app/dashboard"
        />
        <StatCard
          label="Approved Claims"
          value={stats.claimsApproved}
          icon={FaCheckCircle}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          link="/app/dashboard"
        />
        <StatCard
          label="Items Recovered"
          value={stats.itemsRecovered}
          icon={FaEye}
          color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          link="/app/recovered"
        />
        <StatCard
          label="New Messages"
          value={stats.unreadMessages}
          icon={FaComments}
          color="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400"
          link="/app/messages"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition ${link.color} group`}
              >
                <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.date ? new Date(activity.date).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FaHistory className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">No recent activity yet. Start by posting or searching for items!</p>
            <Link
              to="/app/search"
              className="inline-block mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
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
