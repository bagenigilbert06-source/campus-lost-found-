import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminTable from '../../components/admin/AdminTable';
import { 
  FaBoxes, 
  FaClipboardCheck, 
  FaCheckCircle, 
  FaUsers,
  FaExclamationTriangle,
  FaEye,
  FaArrowRight,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingVerification: 0,
    verifiedItems: 0,
    recoveredItems: 0,
    totalUsers: 0,
    lostItems: 0,
    foundItems: 0,
    activeItems: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all items
      const itemsRes = await axios.get(`${API_BASE}/items?limit=100`);
      const items = itemsRes.data?.data || itemsRes.data || [];

      // Calculate stats from items
      const pending = items.filter(item => !item.verificationStatus || item.verificationStatus === 'pending');
      const verified = items.filter(item => item.verificationStatus === 'verified');
      const recovered = items.filter(item => item.status === 'recovered');
      const active = items.filter(item => item.status === 'active');
      const lost = items.filter(item => item.itemType === 'Lost');
      const found = items.filter(item => item.itemType === 'Found');
      const uniqueUsers = new Set(items.map(item => item.userId || item.email).filter(Boolean));

      setStats({
        totalItems: items.length,
        pendingVerification: pending.length,
        verifiedItems: verified.length,
        recoveredItems: recovered.length,
        totalUsers: uniqueUsers.size,
        lostItems: lost.length,
        foundItems: found.length,
        activeItems: active.length
      });

      // Set recent items (last 5)
      const sortedItems = [...items].sort((a, b) => 
        new Date(b.createdAt || b.dateLost) - new Date(a.createdAt || a.dateLost)
      );
      setRecentItems(sortedItems.slice(0, 5));
      
      // Set pending items (first 5)
      setPendingItems(pending.slice(0, 5));
      
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleVerifyItem = async (itemId) => {
    try {
      await axios.patch(`${API_BASE}/items/${itemId}`, {
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      fetchDashboardData();
    } catch (error) {
      console.error('[v0] Error verifying item:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (item) => {
    const status = item.verificationStatus || 'pending';
    const styles = {
      verified: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const isLost = type === 'Lost';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        isLost ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
      }`}>
        {type}
      </span>
    );
  };

  // Table columns for recent items
  const recentItemsColumns = [
    {
      header: 'Item',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0] ? (
            <img 
              src={row.images[0]} 
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FaBoxes className="text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.title}</p>
            <p className="text-xs text-slate-500">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => getTypeBadge(row.itemType)
    },
    {
      header: 'Location',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <FaMapMarkerAlt className="text-slate-400 text-xs" />
          {row.location || 'N/A'}
        </div>
      )
    },
    {
      header: 'Date',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <FaClock className="text-slate-400 text-xs" />
          {formatDate(row.createdAt || row.dateLost)}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row)
    },
    {
      header: '',
      render: (row) => (
        <Link 
          to={`/items/${row._id}`}
          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <FaEye />
        </Link>
      ),
      className: 'w-12'
    }
  ];

  // Table columns for pending items
  const pendingItemsColumns = [
    {
      header: 'Item',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0] ? (
            <img 
              src={row.images[0]} 
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FaBoxes className="text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.title}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{row.description}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => getTypeBadge(row.itemType)
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVerifyItem(row._id)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Verify
          </button>
          <Link 
            to={`/items/${row._id}`}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            View
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Dashboard | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Items"
          value={stats.totalItems}
          icon={FaBoxes}
          color="emerald"
          loading={loading}
        />
        <AdminStatCard
          title="Pending Review"
          value={stats.pendingVerification}
          icon={FaClipboardCheck}
          color="amber"
          loading={loading}
        />
        <AdminStatCard
          title="Verified"
          value={stats.verifiedItems}
          icon={FaCheckCircle}
          color="blue"
          loading={loading}
        />
        <AdminStatCard
          title="Recovered"
          value={stats.recoveredItems}
          icon={FaCheckCircle}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Lost Items</p>
              <p className="text-2xl font-bold text-red-600">{stats.lostItems}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <FaExclamationTriangle className="text-red-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Found Items</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.foundItems}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FaCheckCircle className="text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Items</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeItems}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaBoxes className="text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="text-2xl font-bold text-slate-700">{stats.totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <FaUsers className="text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verification */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Pending Verification</h2>
              <p className="text-sm text-slate-500">{stats.pendingVerification} items need review</p>
            </div>
            <Link 
              to="/admin/pending"
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheckCircle className="text-emerald-500 text-xl" />
                </div>
                <p className="text-slate-600 font-medium">All caught up!</p>
                <p className="text-sm text-slate-500">No items pending verification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    {item.images?.[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FaBoxes className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getTypeBadge(item.itemType)}
                        <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVerifyItem(item._id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Quick Actions</h2>
            <p className="text-sm text-slate-500">Common administrative tasks</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Link 
              to="/admin/pending"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <FaClipboardCheck />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Review Items</p>
                <p className="text-xs text-slate-500">{stats.pendingVerification} pending</p>
              </div>
            </Link>
            <Link 
              to="/admin/items"
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <FaBoxes />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Manage Items</p>
                <p className="text-xs text-slate-500">{stats.totalItems} total</p>
              </div>
            </Link>
            <Link 
              to="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <FaUsers />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">View Users</p>
                <p className="text-xs text-slate-500">{stats.totalUsers} registered</p>
              </div>
            </Link>
            <Link 
              to="/addItems"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <span className="text-lg font-bold">+</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Add Item</p>
                <p className="text-xs text-slate-500">Report new</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Items Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Recent Items</h2>
            <p className="text-sm text-slate-500">Latest reported lost and found items</p>
          </div>
          <Link 
            to="/admin/items"
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View All <FaArrowRight className="text-xs" />
          </Link>
        </div>
        <AdminTable 
          columns={recentItemsColumns}
          data={recentItems}
          loading={loading}
          emptyMessage="No items reported yet"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
