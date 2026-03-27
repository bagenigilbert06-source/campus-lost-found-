import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { FaSearch, FaFilter, FaTimes, FaChevronDown, FaChevronUp, FaLink } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AuthContext from '../../context/Authcontext/AuthContext';
import { useNavigate } from 'react-router-dom';

const SearchItems = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  const [categories] = useState([
    'Electronics', 'IDs', 'Keys', 'Wallets', 'Phones', 
    'Laptops', 'Bags', 'Clothing', 'Books', 'Other'
  ]);
  const [locations] = useState([
    'Gate 1', 'Gate 2', 'Main Building', 'Library', 'Cafeteria',
    'Sports Complex', 'Hostel', 'Parking', 'Security Office', 'Other'
  ]);
  const [conditions] = useState([
    'Good', 'Fair', 'Damaged', 'Unknown'
  ]);
  const [statuses] = useState([
    'Active', 'Claimed', 'Recovered'
  ]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, selectedLocation, selectedStatus, selectedCondition, dateFrom, dateTo, sortBy, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch('http://localhost:3001/api/items?status=active&verificationStatus=verified');
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      setItems(data.data || data || []);
      console.log('[v0] Items fetched:', data);
    } catch (error) {
      console.error('[v0] Error fetching items:', error);
      toast.error('Failed to load items');
      // Fallback with demo data
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items.filter(item => {
      // Search filter
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      
      // Location filter
      const matchesLocation = !selectedLocation || item.location === selectedLocation;
      
      // Status filter
      const matchesStatus = !selectedStatus || 
        (item.status && item.status.toLowerCase() === selectedStatus.toLowerCase());
      
      // Condition filter
      const matchesCondition = !selectedCondition || 
        (item.condition && item.condition.toLowerCase() === selectedCondition.toLowerCase());
      
      // Date range filter
      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const itemDate = new Date(item.dateLost || item.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          matchesDateRange = matchesDateRange && itemDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && itemDate <= toDate;
        }
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesCondition && matchesDateRange;
    });

    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || b.dateLost) - new Date(a.createdAt || a.dateLost));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || a.dateLost) - new Date(b.createdAt || b.dateLost));
    } else if (sortBy === 'viewed') {
      filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }

    setFilteredItems(filtered);
  };

  const handleClaimItem = (itemId) => {
    if (!user) {
      toast.error('Please sign in to claim items');
      return;
    }
    navigate(`/items/${itemId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedStatus('');
    setSelectedCondition('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedLocation || selectedStatus || selectedCondition || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8">
      <Helmet>
        <title>{`Search Lost & Found Items - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Lost & Found Items</h1>
          <p className="text-gray-600">Browse items found on campus and claim if you recognize them</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center gap-2 transition"
            >
              <FaFilter /> Filters
            </button>
          </div>

          {/* Filters Section */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Conditions</option>
                  {conditions.map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="viewed">Most Viewed</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 text-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('')} className="hover:text-green-900">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {selectedLocation}
                <button onClick={() => setSelectedLocation('')} className="hover:text-purple-900">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedCondition && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {selectedCondition}
                <button onClick={() => setSelectedCondition('')} className="hover:text-yellow-900">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {selectedStatus && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                {selectedStatus}
                <button onClick={() => setSelectedStatus('')} className="hover:text-pink-900">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {dateFrom && new Date(dateFrom).toLocaleDateString()} - {dateTo && new Date(dateTo).toLocaleDateString()}
                <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="hover:text-orange-900">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
          </div>
        )}
        </div>

        {/* Results Info */}
        <div className="mb-4 text-gray-600">
          Found {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">No items found matching your search</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                onClaim={handleClaimItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Item Card Component
const ItemCard = ({ item, onClaim }) => {
  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : item.image;

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'recovered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'good': return 'bg-green-50 text-green-700';
      case 'fair': return 'bg-yellow-50 text-yellow-700';
      case 'damaged': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border-l-4 border-teal-500 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e2e8f0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%2364748b">No Image</text></svg>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {item.status && (
          <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title and Category */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {item.category}
            </span>
            {item.condition && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${getConditionColor(item.condition)}`}>
                {item.condition}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{item.description}</p>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4 py-3 border-y border-gray-100">
          <p className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 min-w-fit">Location:</span>
            <span>{item.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 min-w-fit">Date:</span>
            <span>{new Date(item.dateLost || item.createdAt).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onClaim(item._id)}
          className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <FaLink size={14} />
          View & Claim
        </button>
      </div>
    </div>
  );
};

export default SearchItems;
