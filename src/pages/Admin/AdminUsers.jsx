import React, { useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch,
  FiMail,
  FiCalendar,
  FiPackage,
  FiTrendingUp,
} from 'react-icons/fi';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import useAdminUsers from '../../hooks/useAdminUsers';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatCard from '../../components/admin/AdminStatCard';

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    users,
    total,
    stats,
    loading,
    error,
    refetch,
  } = useAdminUsers(currentPage, sortBy);

  // Filter users based on search term
  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    {
      icon: FiTrendingUp,
      label: 'Total Users',
      value: total || 0,
      color: 'blue',
    },
    {
      icon: FiPackage,
      label: 'Items Posted',
      value: stats?.totalItems || 0,
      color: 'green',
    },
    {
      icon: FiTrendingUp,
      label: 'Items Recovered',
      value: stats?.recoveredItems || 0,
      color: 'purple',
    },
  ];

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (email) => (
        <div className="flex items-center gap-2">
          <FiMail size={16} className="text-slate-400" />
          <span className="font-medium text-slate-900">{email}</span>
        </div>
      ),
    },
    {
      key: 'displayName',
      label: 'Name',
      render: (name) => name || 'N/A',
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (date) => (
        <div className="flex items-center gap-2">
          <FiCalendar size={16} className="text-slate-400" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'itemsCount',
      label: 'Items Posted',
      render: (count) => (
        <div className="flex items-center gap-2">
          <FiPackage size={16} className="text-slate-400" />
          <span>{count || 0}</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>{`Users Management | ${schoolConfig.name} Admin`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-600 mt-2">View and manage registered users on the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="displayName">Name (A-Z)</option>
            <option value="-displayName">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">Error loading users</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Users Table */}
      <AdminTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        error={error}
      />

      {/* Pagination Info */}
      <div className="mt-6 text-sm text-slate-600">
        Showing {filteredUsers.length} of {total} users
      </div>
    </div>
  );
};

export default AdminUsers;
