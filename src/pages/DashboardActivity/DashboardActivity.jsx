import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaHistory, FaBox, FaCheckCircle, FaComments, FaPlus, FaEye } from 'react-icons/fa';

const DashboardActivity = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    fetchActivity();
  }, [user, navigate]);

  const fetchActivity = async () => {
    try {
      setLoading(true);

      // Fetch user's items, claims, and messages
      const [itemsRes, claimsRes, messagesRes] = await Promise.all([
        axios.get('http://localhost:3001/api/items', {
          params: { userEmail: user?.email },
          withCredentials: true
        }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/claims', {
          params: { studentEmail: user?.email },
          withCredentials: true
        }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/messages', {
          params: { recipientEmail: user?.email },
          withCredentials: true
        }).catch(() => ({ data: [] }))
      ]);

      const items = Array.isArray(itemsRes.data) ? itemsRes.data : itemsRes.data?.data || [];
      const claims = Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data?.data || [];
      const messages = Array.isArray(messagesRes.data) ? messagesRes.data : messagesRes.data?.data || [];

      // Combine and sort activities by date
      const allActivities = [
        ...items.map(item => ({
          id: item._id,
          type: 'item',
          title: item.title,
          description: `Posted ${item.itemType} item`,
          icon: FaBox,
          color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
          date: item.createdAt,
          details: `Category: ${item.category}`
        })),
        ...claims.map(claim => ({
          id: claim._id,
          type: 'claim',
          title: claim.itemTitle,
          description: `Claim ${claim.status}`,
          icon: FaCheckCircle,
          color: claim.status === 'approved'
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : claim.status === 'rejected'
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
          date: claim.createdAt,
          details: `Status: ${claim.status}`
        })),
        ...messages.map(msg => ({
          id: msg._id,
          type: 'message',
          title: `Message from ${msg.senderName || msg.senderEmail}`,
          description: 'New message received',
          icon: FaComments,
          color: msg.isRead
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            : 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
          date: msg.createdAt,
          details: msg.isRead ? 'Read' : 'Unread'
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setActivities(allActivities);
    } catch (error) {
      console.error('[v0] Error fetching activities:', error);
      toast.error('Failed to load activity history');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const stats = {
    totalActivities: activities.length,
    items: activities.filter(a => a.type === 'item').length,
    claims: activities.filter(a => a.type === 'claim').length,
    messages: activities.filter(a => a.type === 'message').length
  };

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-20" />
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
        <div className={`p-3 rounded-lg flex-shrink-0 ${activity.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">{activity.details}</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`Activity - ${schoolConfig.name}`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Activity History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your recent actions and interactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Activities"
          value={stats.totalActivities}
          icon={FaHistory}
          color="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300"
        />
        <StatCard
          label="Items Posted"
          value={stats.items}
          icon={FaBox}
          color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300"
        />
        <StatCard
          label="Claims"
          value={stats.claims}
          icon={FaCheckCircle}
          color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300"
        />
        <StatCard
          label="Messages"
          value={stats.messages}
          icon={FaComments}
          color="bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Activities
        </button>
        <button
          onClick={() => setFilter('item')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            filter === 'item'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FaBox /> Items
        </button>
        <button
          onClick={() => setFilter('claim')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            filter === 'claim'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FaCheckCircle /> Claims
        </button>
        <button
          onClick={() => setFilter('message')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            filter === 'message'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FaComments /> Messages
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div>
            {filteredActivities.map((activity, idx) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaHistory className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'No activities yet' : `No ${filter}s found`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardActivity;
