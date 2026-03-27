import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaHistory, FaBox, FaCheckCircle, FaComments, FaTag } from 'react-icons/fa';

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

      const allActivities = [
        ...items.map(item => ({
          id: item._id,
          type: 'item',
          title: item.title,
          description: `Posted ${item.itemType} item`,
          icon: FaBox,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          iconBg: 'bg-blue-600',
          date: item.createdAt,
          details: `Category: ${item.category}`
        })),
        ...claims.map(claim => ({
          id: claim._id,
          type: 'claim',
          title: claim.itemTitle,
          description: `Claim ${claim.status}`,
          icon: FaCheckCircle,
          bgColor: claim.status === 'approved' ? 'bg-green-100' : claim.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100',
          textColor: claim.status === 'approved' ? 'text-green-700' : claim.status === 'rejected' ? 'text-red-700' : 'text-amber-700',
          iconBg: claim.status === 'approved' ? 'bg-green-600' : claim.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600',
          date: claim.createdAt,
          details: `Status: ${claim.status}`
        })),
        ...messages.map(msg => ({
          id: msg._id,
          type: 'message',
          title: `Message from ${msg.senderName || msg.senderEmail}`,
          description: 'New message received',
          icon: FaComments,
          bgColor: msg.isRead ? 'bg-gray-100' : 'bg-teal-100',
          textColor: msg.isRead ? 'text-gray-700' : 'text-teal-700',
          iconBg: msg.isRead ? 'bg-gray-600' : 'bg-teal-600',
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
    total: activities.length,
    items: activities.filter(a => a.type === 'item').length,
    claims: activities.filter(a => a.type === 'claim').length,
    messages: activities.filter(a => a.type === 'message').length
  };

  const StatCard = ({ label, value, icon: Icon, bgColor, textColor }) => (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-white`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Activity - {schoolConfig.schoolName} Lost & Found</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity History</h1>
          <p className="text-gray-600">Your recent items, claims, and messages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Activities" value={stats.total} icon={FaHistory} bgColor="bg-teal-50" textColor="text-teal-700" />
          <StatCard label="Items Posted" value={stats.items} icon={FaBox} bgColor="bg-blue-50" textColor="text-blue-700" />
          <StatCard label="Claims" value={stats.claims} icon={FaCheckCircle} bgColor="bg-green-50" textColor="text-green-700" />
          <StatCard label="Messages" value={stats.messages} icon={FaComments} bgColor="bg-purple-50" textColor="text-purple-700" />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { id: 'all', label: 'All Activities', icon: FaHistory },
            { id: 'item', label: 'Items', icon: FaBox },
            { id: 'claim', label: 'Claims', icon: FaCheckCircle },
            { id: 'message', label: 'Messages', icon: FaComments }
          ].map(btn => {
            const BtnIcon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
                  filter === btn.id
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-300'
                }`}
              >
                <BtnIcon className="w-4 h-4" />
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading activity...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FaHistory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className={`${activity.bgColor} border border-gray-200 rounded-lg p-4 hover:shadow-md transition`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${activity.iconBg} flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${activity.textColor} truncate`}>{activity.title}</h3>
                      <p className={`text-sm ${activity.textColor} opacity-75 mt-0.5`}>{activity.description}</p>
                      <p className={`text-xs ${activity.textColor} opacity-60 mt-2`}>{activity.details}</p>
                    </div>
                    <div className={`text-xs ${activity.textColor} opacity-60 flex-shrink-0 whitespace-nowrap`}>
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardActivity;
