import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import {
  FaSearch,
  FaFilter,
  FaTrash,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import AdminContainer from '../../components/admin/AdminContainer';
import EmptyState from '../../components/admin/EmptyState';
import LoadingState from '../../components/admin/LoadingState';

const AdminInventory = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchQuery, filterType, filterStatus, filterVerification]);

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/items');
      setItems(res.data);
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching items:', error);
      toast.error('Failed to load items');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Item type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.itemType === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => (item.status || 'active') === filterStatus);
    }

    // Verification filter
    if (filterVerification !== 'all') {
      filtered = filtered.filter(item => (item.verificationStatus || 'pending') === filterVerification);
    }

    setFilteredItems(filtered);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/items/${itemId}`, {
        withCredentials: true
      });
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleVerifyItem = async (itemId) => {
    try {
      await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
        verificationStatus: 'verified',
        verifiedBy: user.email,
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      
      toast.success('Item verified');
      fetchItems();
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
      fetchItems();
    } catch (error) {
      toast.error('Failed to reject item');
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <LoadingState type="table" count={5} />
      </AdminContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Inventory | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Manage all lost and found items in one place</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by title, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zetech-primary"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
              >
                <option value="all">All Types</option>
                <option value="Lost">Lost Items</option>
                <option value="Found">Found Items</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="recovered">Recovered</option>
                <option value="claimed">Claimed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterVerification('all');
                }}
                className="w-full btn btn-outline btn-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-bold">{filteredItems.length}</span> of <span className="font-bold">{items.length}</span> items
          </p>
        </div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={FaFilter}
            title="No items found"
            description="Try adjusting your filters or search terms"
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Verification</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={item._id} className={`border-b hover:bg-gray-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-sm ${item.itemType === 'Lost' ? 'badge-error' : 'badge-success'}`}>
                          {item.itemType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-sm ${
                          (item.status || 'active') === 'recovered' ? 'badge-success' :
                          (item.status || 'active') === 'claimed' ? 'badge-info' :
                          'badge-primary'
                        }`}>
                          {(item.status || 'active').charAt(0).toUpperCase() + (item.status || 'active').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge badge-sm ${
                          item.verificationStatus === 'verified' ? 'badge-success' :
                          item.verificationStatus === 'rejected' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {(item.verificationStatus || 'pending').charAt(0).toUpperCase() + (item.verificationStatus || 'pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/items/${item._id}`}
                            className="btn btn-xs btn-ghost text-zetech-primary"
                            title="View"
                          >
                            <FaEye size={12} />
                          </Link>
                          {item.verificationStatus !== 'verified' && (
                            <>
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
                                <FaTimesCircle size={12} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="btn btn-xs btn-outline border-red-500 text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {filteredItems.map(item => (
                <div key={item._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    </div>
                    <span className={`badge badge-xs ${item.itemType === 'Lost' ? 'badge-error' : 'badge-success'}`}>
                      {item.itemType}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3 text-sm">
                    <p className="text-gray-600"><span className="font-medium">Location:</span> {item.location}</p>
                    <div className="flex gap-2">
                      <span className={`badge badge-sm ${
                        (item.status || 'active') === 'recovered' ? 'badge-success' :
                        (item.status || 'active') === 'claimed' ? 'badge-info' :
                        'badge-primary'
                      }`}>
                        {(item.status || 'active')}
                      </span>
                      <span className={`badge badge-sm ${
                        item.verificationStatus === 'verified' ? 'badge-success' :
                        item.verificationStatus === 'rejected' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {(item.verificationStatus || 'pending')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      to={`/items/${item._id}`}
                      className="btn btn-xs btn-ghost text-zetech-primary flex-1"
                    >
                      <FaEye size={12} /> View
                    </Link>
                    {item.verificationStatus !== 'verified' && (
                      <button
                        onClick={() => handleVerifyItem(item._id)}
                        className="btn btn-xs btn-success text-white flex-1"
                      >
                        <FaCheckCircle size={12} /> Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="btn btn-xs btn-error text-white flex-1"
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminContainer>
    </>
  );
};

export default AdminInventory;
