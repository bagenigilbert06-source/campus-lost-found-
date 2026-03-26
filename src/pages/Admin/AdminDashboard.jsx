import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiClock,
  FiTrendingUp,
} from 'react-icons/fi';
import { AuthContext } from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import useAdminDashboard from '../../hooks/useAdminDashboard';
import adminService from '../../services/adminService';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/shared/StatusBadge';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { stats, recentItems, recentUsers, loading, error, refetch } =
    useAdminDashboard();

  const handleVerifyItem = async (itemId) => {
    try {
      await adminService.verifyItem(itemId);
      toast.success('Item verified successfully!');
      refetch();
    } catch (err) {
      toast.error('Failed to verify item');
    }
  };

  const handleRejectItem = async (itemId) => {
    try {
      await adminService.rejectItem(itemId);
      toast.success('Item rejected');
      refetch();
    } catch (err) {
      toast.error('Failed to reject item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await adminService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  // Stat cards configuration
  const statCards = [
    {
      icon: FiPackage,
      label: 'Total Items',
      value: stats?.totalItems || 0,
      color: 'blue',
      trend: { direction: 'up', percentage: 12 },
    },
    {
      icon: FiClock,
      label: 'Pending Verification',
      value: stats?.pendingVerification || 0,
      color: 'yellow',
    },
    {
      icon: FiCheckCircle,
      label: 'Verified Items',
      value: stats?.verifiedItems || 0,
      color: 'green',
      trend: { direction: 'up', percentage: 8 },
    },
    {
      icon: FiTrendingUp,
      label: 'Recovered Items',
      value: stats?.recoveredItems || 0,
      color: 'purple',
      trend: { direction: 'up', percentage: 5 },
    },
    {
      icon: FiUsers,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      color: 'indigo',
      trend: { direction: 'up', percentage: 15 },
    },
    {
      icon: FiXCircle,
      label: 'Rejected Items',
      value: stats?.rejectedItems || 0,
      color: 'red',
    },
  ];

  // Recent items table columns
  const itemColumns = [
    { key: 'title', label: 'Title' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    {
      key: 'createdAt',
      label: 'Date Posted',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  // Recent items actions
  const itemActions = [
    {
      label: 'Verify',
      variant: 'success',
      onClick: (item) => handleVerifyItem(item._id || item.id),
    },
    {
      label: 'Reject',
      variant: 'danger',
      onClick: (item) => handleRejectItem(item._id || item.id),
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (item) => handleDeleteItem(item._id || item.id),
    },
  ];

  // Recent users table columns
  const userColumns = [
    { key: 'email', label: 'Email' },
    { key: 'displayName', label: 'Name' },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>{`Admin Dashboard | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2 text-lg">
              Welcome back, <span className="font-semibold text-slate-900">{user?.displayName || 'Administrator'}</span>
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <AdminStatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={card.value}
            color={card.color}
            loading={loading}
          />
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-700 font-medium">Error loading dashboard</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Recent Items Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Items</h2>
            <p className="text-slate-600 text-sm mt-1">
              Latest items posted to the platform
            </p>
          </div>
          <a 
            href="/admin/items" 
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            View All →
          </a>
        </div>
        <AdminTable
          columns={itemColumns}
          data={recentItems}
          loading={loading}
          actions={itemActions}
        />
      </div>

      {/* Recent Users Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Users</h2>
            <p className="text-slate-600 text-sm mt-1">
              Latest registered users on the platform
            </p>
          </div>
          <a 
            href="/admin/users" 
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            View All →
          </a>
        </div>
        <AdminTable
          columns={userColumns}
          data={recentUsers}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
