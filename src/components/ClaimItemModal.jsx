import React, { useState, useContext } from 'react';
import { FaTimes, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import AuthContext from '../context/Authcontext/AuthContext';

const ClaimItemModal = ({ isOpen, onClose, itemId, itemTitle, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    claimantName: user?.displayName || '',
    claimantEmail: user?.email || '',
    claimantPhone: '',
    claimantStudentId: '',
    proofOfOwnership: '',
    claimNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.claimantName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.claimantEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.claimantPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!formData.claimantStudentId.trim()) {
      toast.error('Please enter your student ID');
      return;
    }
    if (!formData.proofOfOwnership.trim() || formData.proofOfOwnership.length < 10) {
      toast.error('Please provide detailed proof of ownership (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/claims', {
        itemId,
        itemTitle,
        claimantEmail: formData.claimantEmail,
        claimantName: formData.claimantName,
        claimantPhone: formData.claimantPhone,
        claimantStudentId: formData.claimantStudentId,
        proofOfOwnership: formData.proofOfOwnership,
        claimNotes: formData.claimNotes,
      }, { withCredentials: true });

      if (response.status === 201 || response.data.success) {
        toast.success('Claim submitted successfully! Admin will review and contact you soon.');
        setFormData({
          claimantName: user?.displayName || '',
          claimantEmail: user?.email || '',
          claimantPhone: '',
          claimantStudentId: '',
          proofOfOwnership: '',
          claimNotes: ''
        });
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('[v0] Claim submission error:', error);
      toast.error(error.response?.data?.message || 'Error submitting claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Claim Item</h2>
            <p className="text-teal-100 text-sm mt-1">{itemTitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:text-teal-100 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="claimantName"
              value={formData.claimantName}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="claimantEmail"
              value={formData.claimantEmail}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="claimantPhone"
              value={formData.claimantPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              name="claimantStudentId"
              value={formData.claimantStudentId}
              onChange={handleChange}
              placeholder="Enter your student ID"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
          </div>

          {/* Proof of Ownership */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proof of Ownership *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Describe specific details that prove this item belongs to you (e.g., unique marks, serial number, etc.)
            </p>
            <textarea
              name="proofOfOwnership"
              value={formData.proofOfOwnership}
              onChange={handleChange}
              placeholder="e.g., It has a blue sticker on the back and my initials on the inside..."
              rows="4"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              name="claimNotes"
              value={formData.claimNotes}
              onChange={handleChange}
              placeholder="Any additional information that might help with the claim..."
              rows="3"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Submit Claim
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimItemModal;
