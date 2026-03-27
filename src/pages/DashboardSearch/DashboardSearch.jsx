import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaSearch, FaFilter, FaBox, FaTimes, FaMapPin, FaCalendarAlt, FaTag, FaSort, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import PaginationComponent from '../../components/PaginationComponent';
import BookmarkButton from '../../components/BookmarkButton';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DashboardSearch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const itemsPerPage = 12;
  const [filters, setFilters] = useState({
    itemType: 'all',
    status: 'all',
    category: 'all',
    dateFrom: null,
    dateTo: null,
    condition: 'all'
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
  }, [searchTerm, filters, items, sortBy]);

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

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.itemType !== 'all') {
      filtered = filtered.filter(item => item.itemType?.toLowerCase() === filters.itemType.toLowerCase());
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category?.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status?.toLowerCase() === filters.status.toLowerCase());
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(item => new Date(item.createdAt) >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => new Date(item.createdAt) <= filters.dateTo);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const ItemCard = ({ item }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer group"
      onClick={() => navigate(`/app/item-details/${item._id}`)}
    >
      {/* Item Image */}
      {item.images && item.images[0] && (
        <div className="h-40 bg-gray-100 overflow-hidden relative">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm font-medium ${
            item.itemType?.toLowerCase() === 'lost' ? 'bg-orange-500' : 'bg-green-500'
          }`}>
            {item.itemType}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="absolute top-3 left-3"
          >
            <BookmarkButton itemId={item._id} size="md" />
          </button>
        </div>
      )}

      {/* Item Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
            <FaTag className="w-3 h-3" />
            {item.category}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
            item.status?.toLowerCase() === 'recovered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {item.status || 'Unclaimed'}
          </span>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 space-y-1">
          {item.location && (
            <div className="flex items-center gap-2">
              <FaMapPin className="w-3 h-3" />
              {item.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Search Items - {schoolConfig.name} Lost & Found</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Items</h1>
          <p className="text-gray-600">Find lost and found items on campus</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
            <FaSearch className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-white rounded-lg transition"
              >
                <FaTimes className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: 'itemType', label: 'Item Type', options: itemTypes },
              { key: 'category', label: 'Category', options: categories },
              { key: 'status', label: 'Status', options: statuses }
            ].map(filterGroup => (
              <div key={filterGroup.key} className="bg-white rounded-lg border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaFilter className="w-4 h-4" />
                  {filterGroup.label}
                </label>
                <select
                  value={filters[filterGroup.key]}
                  onChange={(e) => setFilters({ ...filters, [filterGroup.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="all">All {filterGroup.label}</option>
                  {filterGroup.options.map(option => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Sort */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaSort className="w-4 h-4" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-300 font-medium"
          >
            <FaFilter size={16} />
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <DatePicker
                  selected={filters.dateFrom}
                  onChange={(date) => setFilters({ ...filters, dateFrom: date })}
                  placeholderText="Select start date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <DatePicker
                  selected={filters.dateTo}
                  onChange={(date) => setFilters({ ...filters, dateTo: date })}
                  placeholderText="Select end date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={() => setFilters({ ...filters, dateFrom: null, dateTo: null })}
                className="col-span-1 md:col-span-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                Clear Date Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block mb-4">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FaBox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No items found</p>
            <p className="text-sm text-gray-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Found <span className="font-semibold text-gray-900">{filteredItems.length}</span> item{filteredItems.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
                totalItems={filteredItems.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default DashboardSearch;
