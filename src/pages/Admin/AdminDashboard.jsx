import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import { 
  FaBoxes, 
  FaClipboardList, 
  FaCheckCircle, 
  FaEnvelope,
  FaPlus,
  FaEye
} from 'react-icons/fa';
import AdminContainer from '../../components/admin/AdminContainer';
import StatsCard from '../../components/admin/StatsCard';
import EmptyState from '../../components/admin/EmptyState';
import LoadingState from '../../components/admin/LoadingState';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingVerification: 0,
    verifiedItems: 0,
    recoveredItems: 0,
    totalUsers: 0,
    unreadMessages: 0
  });
  const [pendingItems, setPendingItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const itemsRes = await axios.get('http://localhost:3001/api/items');
      const items = itemsRes.data;

      const messagesRes = await axios.get('http://localhost:3001/api/messages?role=admin', {
        withCredentials: true
      }).catch(() => ({ data: [] }));

      const pendingItems = items.filter(item => item.verificationStatus === 'pending' || !item.verificationStatus);
      const verifiedItems = items.filter(item => item.verificationStatus === 'verified');
      const unreadMessages = messagesRes.data?.filter(m => !m.isRead && m.recipientRole === 'admin').length || 0;

      setStats({
        totalItems: items.length,
        pendingVerification: pendingItems.length,
        verifiedItems: verifiedItems.length,
        recoveredItems: items.filter(i => i.status === 'recovered').length || 0,
        totalUsers: new Set(items.map(item => item.email)).size,
        unreadMessages: unreadMessages
      });

      setPendingItems(pendingItems.slice(0, 5));
      setRecentActivity(items.slice(-5).reverse());
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleVerifyItem = async (itemId) => {
    try {
      await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
        verificationStatus: 'verified',
        verifiedBy: user.email,
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      
      toast.success('Item verified successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to verify item');
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
        verificationStatus: 'rejected',
        verifiedBy: user.email,
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      
      toast.success('Item rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject item');
    }
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
        <title>{`Admin Dashboard | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.displayName || 'Admin'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            icon={FaBoxes}
            label="Total Items"
            value={stats.totalItems}
            color="zetech-primary"
          />
          <StatsCard
            icon={FaClipboardList}
            label="Pending Review"
            value={stats.pendingVerification}
            color="yellow"
          />
          <StatsCard
            icon={FaCheckCircle}
            label="Verified Items"
            value={stats.verifiedItems}
            color="green"
          />
          <StatsCard
            icon={FaCheckCircle}
            label="Recovered"
            value={stats.recoveredItems}
            color="zetech-secondary"
          />
          <StatsCard
            icon={FaEnvelope}
            label="Unread Messages"
            value={stats.unreadMessages}
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pending Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Pending Verification</h2>
              <Link 
                to="/admin/inventory" 
                className="text-zetech-primary hover:text-zetech-secondary text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {pendingItems.length === 0 ? (
              <EmptyState
                icon={FaClipboardList}
                title="All caught up!"
                description="No items pending verification"
              />
            ) : (
              <div className="space-y-3">
                {pendingItems.map(item => (
                  <div key={item._id} className="flex items-start justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200/50">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{item.location}</p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => handleVerifyItem(item._id)}
                        className="btn btn-xs btn-success text-white"
                        title="Verify"
                      >
                        <FaCheckCircle size={12} />
                      </button>
                      <button
                        onClick={() => handleRejectItem(item._id)}
                        className="btn btn-xs btn-error text-white"
                        title="Reject"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/addItems"
                className="flex items-center gap-3 p-3 rounded-lg bg-zetech-primary/10 hover:bg-zetech-primary/20 transition"
              >
                <FaPlus className="text-zetech-primary" />
                <span className="font-medium text-gray-900">Report New Item</span>
              </Link>
              <Link 
                to="/admin/inventory"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-100/50 hover:bg-blue-100 transition"
              >
                <FaEye className="text-blue-600" />
                <span className="font-medium text-gray-900">Manage Inventory</span>
              </Link>
              <Link 
                to="/admin/claims"
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-100/50 hover:bg-purple-100 transition"
              >
                <FaEnvelope className="text-purple-600" />
                <span className="font-medium text-gray-900">View Claims & Messages</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Items will appear here as they are reported"
            />
          ) : (
            <div className="space-y-3">
              {recentActivity.map(item => (
                <div 
                  key={item._id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.itemType} • {item.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`badge badge-sm ${
                      item.verificationStatus === 'verified' ? 'badge-success' :
                      item.verificationStatus === 'rejected' ? 'badge-error' :
                      'badge-warning'
                    }`}>
                      {item.verificationStatus || 'pending'}
                    </span>
                    <Link 
                      to={`/items/${item._id}`}
                      className="btn btn-xs btn-ghost text-zetech-primary"
                    >
                      <FaEye size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminContainer>
    </>
  );
};

export default AdminDashboard;
