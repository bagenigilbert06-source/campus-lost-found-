import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { 
  FaBoxes, 
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMapMarkerAlt,
  FaClock,
  FaUser
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminPending = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/items?limit=100`);
      const items = res.data?.data || res.data || [];
      const pending = items.filter(item => !item.verificationStatus || item.verificationStatus === 'pending');
      setPendingItems(pending);
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching pending items:', error);
      setLoading(false);
    }
  };

  const handleVerify = async (itemId) => {
    try {
      await axios.patch(`${API_BASE}/items/${itemId}`, {
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      toast.success('Item verified successfully');
      fetchPendingItems();
    } catch (error) {
      toast.error('Failed to verify item');
    }
  };

  const handleReject = async (itemId) => {
    try {
      await axios.patch(`${API_BASE}/items/${itemId}`, {
        verificationStatus: 'rejected',
        verifiedAt: new Date().toISOString()
      }, { withCredentials: true });
      toast.success('Item rejected');
      fetchPendingItems();
    } catch (error) {
      toast.error('Failed to reject item');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-200 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pendingItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <Helmet>
          <title>{`Pending Review | ${schoolConfig.name} Admin`}</title>
        </Helmet>
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="text-emerald-500 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">All Caught Up!</h2>
        <p className="text-slate-500">There are no items pending verification at the moment.</p>
        <Link 
          to="/admin/items"
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
        >
          View All Items
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Pending Review (${pendingItems.length}) | ${schoolConfig.name} Admin`}</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500">
            <span className="font-semibold text-amber-600">{pendingItems.length}</span> items need your review
          </p>
        </div>
      </div>

      {/* Pending Items List */}
      <div className="space-y-4">
        {pendingItems.map(item => (
          <div key={item._id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image */}
              <div className="flex-shrink-0">
                {item.images?.[0] ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full lg:w-32 h-48 lg:h-32 rounded-xl object-cover bg-slate-100"
                  />
                ) : (
                  <div className="w-full lg:w-32 h-48 lg:h-32 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FaBoxes className="text-slate-400 text-3xl" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.itemType === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.itemType}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex-shrink-0">
                    Pending Review
                  </span>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-slate-400" />
                    {item.location || 'Unknown location'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaClock className="text-slate-400" />
                    {formatDate(item.createdAt || item.dateLost)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaUser className="text-slate-400" />
                    {item.email || 'Anonymous'}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVerify(item._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <FaCheckCircle />
                    Verify
                  </button>
                  <button
                    onClick={() => handleReject(item._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <FaTimesCircle />
                    Reject
                  </button>
                  <Link
                    to={`/items/${item._id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    <FaEye />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPending;
