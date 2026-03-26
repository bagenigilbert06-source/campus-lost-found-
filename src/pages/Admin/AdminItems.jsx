import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
} from 'react-icons/fi';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import useAdminItems from '../../hooks/useAdminItems';
import adminService from '../../services/adminService';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/shared/StatusBadge';

const AdminItems = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    items,
    total,
    loading,
    error,
    refetch,
    categories,
  } = useAdminItems(currentPage, filterStatus, filterCategory);

  // Filter items based on search term
  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerify = async (itemId) => {
    try {
      await adminService.verifyItem(itemId);
      toast.success('Item verified successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to verify item');
      console.error(err);
    }
  };

  const handleReject = async (itemId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      await adminService.rejectItem(itemId, reason);
      toast.success('Item rejected');
      refetch();
    } catch (err) {
      toast.error('Failed to reject item');
      console.error(err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await adminService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to delete item');
      console.error(err);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (title) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{title}</span>
        </div>
      ),
    },
    { key: 'itemType', label: 'Type' },
    { key: 'category', label: 'Category' },
    {
      key: 'verificationStatus',
      label: 'Verification',
      render: (status) => <StatusBadge status={status || 'pending'} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'createdAt',
      label: 'Posted',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: 'Verify',
      variant: 'success',
      onClick: (item) => handleVerify(item._id || item.id),
    },
    {
      label: 'Reject',
      variant: 'warning',
      onClick: (item) => handleReject(item._id || item.id),
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (item) => handleDelete(item._id || item.id),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>{`Items Management | ${schoolConfig.name} Admin`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Items Management</h1>
        <p className="text-slate-600 mt-2">Manage and verify all items posted on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
            <option value="recovered">Recovered</option>
          </select>

          {/* Verification Filter */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterCategory('all');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">Error loading items</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Items Table */}
      <AdminTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        error={error}
        actions={actions}
      />

      {/* Pagination Info */}
      <div className="mt-6 text-sm text-slate-600">
        Showing {filteredItems.length} of {total} items
      </div>
    </div>
  );
};

export default AdminItems;
