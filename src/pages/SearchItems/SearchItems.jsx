import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AuthContext from '../../context/Authcontext/AuthContext';

const SearchItems = () => {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories] = useState([
    'Electronics', 'IDs', 'Keys', 'Wallets', 'Phones', 
    'Laptops', 'Bags', 'Clothing', 'Books', 'Other'
  ]);
  const [locations] = useState([
    'Gate 1', 'Gate 2', 'Main Building', 'Library', 'Cafeteria',
    'Sports Complex', 'Hostel', 'Parking', 'Security Office', 'Other'
  ]);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, selectedLocation, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch('http://localhost:3001/api/items?status=active');
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
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesLocation = !selectedLocation || item.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });

    setFilteredItems(filtered);
  };

  const handleClaimItem = (itemId) => {
    if (!user) {
      toast.error('Please sign in to claim items');
      return;
    }
    // Navigate to claim page or open claim modal
    window.location.href = `/claim/${itemId}`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location Found</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Filter Tags */}
          {(searchQuery || selectedCategory || selectedLocation) && (
            <div className="flex gap-2 flex-wrap">
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">
                    <FaTimes />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="hover:text-green-900">
                    <FaTimes />
                  </button>
                </span>
              )}
              {selectedLocation && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Location: {selectedLocation}
                  <button onClick={() => setSelectedLocation('')} className="hover:text-purple-900">
                    <FaTimes />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear All
              </button>
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-teal-500">
      {/* Image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e2e8f0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%2364748b">No Image</text></svg>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{item.title}</h3>
          <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {item.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Date Found:</strong> {new Date(item.dateLost).toLocaleDateString()}</p>
        </div>

        <button
          onClick={() => onClaim(item._id)}
          className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition"
        >
          Claim Item
        </button>
      </div>
    </div>
  );
};

export default SearchItems;
