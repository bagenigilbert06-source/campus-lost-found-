import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaSearch, FaFilter, FaBox, FaTimes } from 'react-icons/fa';

const DashboardSearch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    itemType: 'all',
    status: 'all',
    category: 'all'
  });

  const categories = ['Electronics', 'Clothing', 'Books', 'Accessories', 'Documents', 'Other'];
  const itemTypes = ['Lost', 'Found'];
  const statuses = ['Pending', 'Verified', 'Recovered', 'Unclaimed'];

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    fetchItems();
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/items', {
        withCredentials: true
      }).catch(() => ({ data: [] }));

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setItems(data);
    } catch (error) {
      console.error('[v0] Error fetching items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Item type filter
    if (filters.itemType !== 'all') {
      filtered = filtered.filter(item => item.itemType?.toLowerCase() === filters.itemType.toLowerCase());
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category?.toLowerCase() === filters.category.toLowerCase());
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status?.toLowerCase() === filters.status.toLowerCase());
    }

    setFilteredItems(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      itemType: 'all',
      status: 'all',
      category: 'all'
    });
  };

  const ItemCard = ({ item }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
      {item.images && item.images[0] && (
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            item.itemType === 'Lost'
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
          }`}>
            {item.itemType}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>{item.category}</span>
          <span>{item.location}</span>
        </div>

        <button
          onClick={() => navigate(`/items/${item._id}`)}
          className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
        >
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`Search Items - ${schoolConfig.name}`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Search Items</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find lost or found items on campus
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>
          {(searchTerm || filters.itemType !== 'all' || filters.category !== 'all' || filters.status !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition flex items-center gap-2"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Type</label>
            <select
              value={filters.itemType}
              onChange={(e) => setFilters({ ...filters, itemType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Types</option>
              {itemTypes.map(type => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      ) : filteredItems.length > 0 ? (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Showing {filteredItems.length} of {items.length} items
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FaBox className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || filters.itemType !== 'all' || filters.category !== 'all'
              ? 'No items match your search criteria'
              : 'No items available yet'}
          </p>
          <button
            onClick={clearFilters}
            className="inline-block px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardSearch;
