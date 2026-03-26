import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { schoolConfig } from '../../config/schoolConfig';
import { 
  FaClock,
  FaPlus,
  FaCheck,
  FaTimes,
  FaEdit
} from 'react-icons/fa';
import AdminContainer from '../../components/admin/AdminContainer';
import EmptyState from '../../components/admin/EmptyState';
import LoadingState from '../../components/admin/LoadingState';

const AdminActivityLog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/items');
      setItems(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching items:', error);
      toast.error('Failed to load activity log');
      setLoading(false);
    }
  };

  const getActivityLog = () => {
    const activities = [];

    items.forEach(item => {
      // Item created
      if (item.createdAt) {
        activities.push({
          id: `${item._id}-created`,
          timestamp: new Date(item.createdAt),
          action: 'created',
          title: `Item created: ${item.title}`,
          description: `${item.itemType} item reported`,
          icon: FaPlus,
          color: 'blue',
          itemId: item._id
        });
      }

      // Item verified
      if (item.verificationStatus === 'verified' && item.verifiedAt) {
        activities.push({
          id: `${item._id}-verified`,
          timestamp: new Date(item.verifiedAt),
          action: 'verified',
          title: `Item verified: ${item.title}`,
          description: `Verified by ${item.verifiedBy}`,
          icon: FaCheck,
          color: 'green',
          itemId: item._id
        });
      }

      // Item rejected
      if (item.verificationStatus === 'rejected' && item.verifiedAt) {
        activities.push({
          id: `${item._id}-rejected`,
          timestamp: new Date(item.verifiedAt),
          action: 'rejected',
          title: `Item rejected: ${item.title}`,
          description: `Rejected by ${item.verifiedBy}`,
          icon: FaTimes,
          color: 'red',
          itemId: item._id
        });
      }

      // Item status updated
      if (item.status && item.updatedAt) {
        activities.push({
          id: `${item._id}-status`,
          timestamp: new Date(item.updatedAt),
          action: 'status_updated',
          title: `Status updated: ${item.title}`,
          description: `Marked as ${item.status}`,
          icon: FaEdit,
          color: 'purple',
          itemId: item._id
        });
      }
    });

    // Sort by timestamp descending (newest first)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Filter by action
    if (filterAction !== 'all') {
      return activities.filter(a => a.action === filterAction);
    }

    return activities;
  };

  const activities = getActivityLog();

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      purple: 'bg-purple-100 text-purple-700',
      yellow: 'bg-yellow-100 text-yellow-700'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <AdminContainer>
        <LoadingState type="full" />
      </AdminContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Activity Log | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 mt-1">Track all system activities and changes</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Action</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterAction('all')}
              className={`btn btn-sm ${filterAction === 'all' ? 'btn-primary bg-zetech-primary border-0 text-white' : 'btn-outline'}`}
            >
              All Activities
            </button>
            <button
              onClick={() => setFilterAction('created')}
              className={`btn btn-sm ${filterAction === 'created' ? 'btn-primary bg-blue-600 border-0 text-white' : 'btn-outline'}`}
            >
              Created
            </button>
            <button
              onClick={() => setFilterAction('verified')}
              className={`btn btn-sm ${filterAction === 'verified' ? 'btn-primary bg-green-600 border-0 text-white' : 'btn-outline'}`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilterAction('rejected')}
              className={`btn btn-sm ${filterAction === 'rejected' ? 'btn-primary bg-red-600 border-0 text-white' : 'btn-outline'}`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilterAction('status_updated')}
              className={`btn btn-sm ${filterAction === 'status_updated' ? 'btn-primary bg-purple-600 border-0 text-white' : 'btn-outline'}`}
            >
              Status Updated
            </button>
          </div>
        </div>

        {/* Activity List */}
        {activities.length === 0 ? (
          <EmptyState
            icon={FaClock}
            title="No activities found"
            description="No activities match your filter"
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Desktop Timeline */}
            <div className="hidden md:block">
              <div className="relative space-y-0">
                {activities.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-6 p-6 border-b last:border-b-0 hover:bg-gray-50 transition">
                      {/* Timeline Icon */}
                      <div className="flex flex-col items-center">
                        <div className={`p-3 rounded-full ${getColorClasses(activity.color)}`}>
                          <Icon size={16} />
                        </div>
                        {idx !== activities.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                        )}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 pt-1">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {activities.map(activity => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="p-4">
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-full h-fit ${getColorClasses(activity.color)}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AdminContainer>
    </>
  );
};

export default AdminActivityLog;
