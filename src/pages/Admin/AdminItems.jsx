import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import AdminTable from '../../components/admin/AdminTable';
import { 
  FaBoxes, 
  FaSearch,
  FaFilter,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    verification: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, filters]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/items?limit=100`);
      const data = res.data?.data || res.data || [];
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching items:', error);
      setLoading(false);
    }
  };

  const filterItems = () => {
    let result = [...items];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    if (filters.type) {
      result = result.filter(item => item.itemType === filters.type);
    }

    if (filters.status) {
      result = result.filter(item => item.status === filters.status);
    }

    if (filters.verification) {
      result = result.filter(item => 
        (item.verificationStatus || 'pending') === filters.verification
      );
    }

    setFilteredItems(result);
  };

  const handleVerify = async (itemId, status) => {
    try {
      await axios.patch(`${API_BASE}/items/${itemId}`, {
        verificationStatus: status,
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      toast.success(`Item ${status}`);
      fetchItems();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_BASE}/items/${itemId}`, { withCredentials: true });
      toast.success('Item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/items/${itemId}`, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      }, { withCredentials: true });
      toast.success(`Status updated to ${newStatus}`);
      fetchItems();
    } catch (error) {
      toast.error('Failed to update status');
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

  const columns = [
    {
      header: 'Item',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.images?.[0] ? (
            <img 
              src={row.images[0]} 
              alt={row.title}
              className="w-12 h-12 rounded-lg object-cover bg-slate-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <FaBoxes className="text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-800">{row.title}</p>
            <p className="text-xs text-slate-500">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          row.itemType === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {row.itemType}
        </span>
      )
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
      render: (row) => (
        <select
          value={row.status || 'active'}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="select select-bordered select-sm text-xs"
        >
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="recovered">Recovered</option>
        </select>
      )
    },
    {
      header: 'Verification',
      render: (row) => {
        const status = row.verificationStatus || 'pending';
        const styles = {
          verified: 'bg-emerald-100 text-emerald-700',
          pending: 'bg-amber-100 text-amber-700',
          rejected: 'bg-red-100 text-red-700'
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link 
            to={`/items/${row._id}`}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View"
          >
            <FaEye />
          </Link>
          {(!row.verificationStatus || row.verificationStatus === 'pending') && (
            <>
              <button
                onClick={() => handleVerify(row._id, 'verified')}
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Verify"
              >
                <FaCheckCircle />
              </button>
              <button
                onClick={() => handleVerify(row._id, 'rejected')}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Reject"
              >
                <FaTimesCircle />
              </button>
            </>
          )}
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`All Items | ${schoolConfig.name} Admin`}</title>
      </Helmet>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center">
            <FaFilter className="text-slate-400 hidden lg:block" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="select select-bordered select-sm bg-slate-50"
            >
              <option value="">All Types</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select select-bordered select-sm bg-slate-50"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="recovered">Recovered</option>
            </select>
            <select
              value={filters.verification}
              onChange={(e) => setFilters({ ...filters, verification: e.target.value })}
              className="select select-bordered select-sm bg-slate-50"
            >
              <option value="">All Verification</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{filteredItems.length}</span> of {items.length} items
        </p>
      </div>

      {/* Table */}
      <AdminTable 
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyMessage="No items found matching your criteria"
      />
    </div>
  );
};

export default AdminItems;
