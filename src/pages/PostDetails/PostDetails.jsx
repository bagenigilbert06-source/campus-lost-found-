import React, { useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useContext } from 'react';
import AuthContext from './../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import { schoolConfig } from '../../config/schoolConfig';
import { FaCheckCircle, FaClock, FaShieldAlt, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaPhone, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';
import ClaimItemModal from '../../components/ClaimItemModal';

const PostDetails = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const item = useLoaderData();
  const navigate = useNavigate();
  const isVerified = item.verificationStatus === 'verified';
  const [showModal, setShowModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [recoveredLocation, setRecoveredLocation] = useState('');
  const [recoveredDate, setRecoveredDate] = useState(new Date());
  const [isRecovered, setIsRecovered] = useState(item.itemType === 'Recovered');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const axiosSecure = UseAxiosSecure();

  // Get images from images array or fallback to single image
  const images = (item.images && item.images.length > 0) ? item.images : (item.image ? [item.image] : []);

  // Check if current user is the item owner
  const isItemOwner = user && user.email === item.email;

  // Handle delete item
  const handleDeleteItem = () => {
    Swal.fire({
      title: 'Delete Item?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3001/api/items/${item._id}`, {
          method: 'DELETE',
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('[v0] Delete response:', data);
            if (data.deletedCount > 0 || data.success || data.message) {
              Swal.fire('Deleted!', 'Your item has been deleted.', 'success').then(() => {
                navigate('/myItems');
              });
            } else {
              Swal.fire('Error!', 'Item could not be deleted.', 'error');
            }
          })
          .catch((error) => {
            console.error('[v0] Delete error:', error);
            Swal.fire('Error!', 'An error occurred while deleting the item.', 'error');
          });
      }
    });
  };

  const handleSubmit = async () => {
    try {
      // Claim the item using the backend API
      const response = await axiosSecure.post(`/items/${item._id}/claim`, {}, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        toast.success('Item marked as recovered!');
        setIsRecovered(true);
        setShowModal(false);
      } else {
        toast.error('Error recovering item. Please try again.');
      }
    } catch (error) {
      console.error('[v0] Error claiming item:', error);
      toast.error(error.response?.data?.message || 'Error recovering item. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-8 py-8 mb-10 mt-10 bg-white rounded-lg shadow-lg space-y-8">
      <Helmet>
        <title>{`${item.title || 'Item Details'} - ${schoolConfig.name}`}</title>
      </Helmet>
      {/* Verification Status Banner */}
      <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
        isVerified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          {isVerified ? (
            <FaCheckCircle className="text-2xl text-green-600" />
          ) : (
            <FaClock className="text-2xl text-yellow-600" />
          )}
          <div>
            <p className={`font-semibold ${isVerified ? 'text-green-700' : 'text-yellow-700'}`}>
              {isVerified ? 'Verified by Security Office' : 'Pending Verification'}
            </p>
            <p className="text-sm text-gray-600">
              {isVerified 
                ? 'This item has been verified by the security office.' 
                : 'This item is awaiting verification by the security office.'
              }
            </p>
          </div>
        </div>
        {isVerified && item.verifiedBy && (
          <div className="text-right text-sm text-gray-500">
            <p>Verified by: {item.verifiedBy}</p>
            {item.verifiedAt && <p>{new Date(item.verifiedAt).toLocaleDateString()}</p>}
          </div>
        )}
      </div>

      <h2 className="text-3xl font-extrabold text-zetech-primary mb-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {item.title}
      </h2>
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Image Gallery Section */}
        <div className="w-full md:w-1/2">
          {/* Main Image */}
          <div className="relative w-full h-96 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center mb-4">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement?.querySelector('[data-placeholder="true"]');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback Placeholder */}
            {images.length === 0 && (
              <div data-placeholder="true" className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect width="300" height="200" fill="#e2e8f0"/>
                  <text x="150" y="100" textAnchor="middle" fontSize="18" fill="#64748b" fontFamily="Arial">
                    No Image Available
                  </text>
                </svg>
              </div>
            )}
            
            {/* Hidden Placeholder for Error State */}
            <div data-placeholder="true" className="hidden w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="300" height="200" fill="#e2e8f0"/>
                <text x="150" y="100" textAnchor="middle" fontSize="18" fill="#64748b" fontFamily="Arial">
                  Image Failed to Load
                </text>
              </svg>
            </div>

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition"
                >
                  <FaChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    idx === currentImageIndex ? 'border-teal-600' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${item.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {item.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.status === 'active' ? 'bg-green-100 text-green-700' :
                item.status === 'claimed' ? 'bg-yellow-100 text-yellow-700' :
                item.status === 'recovered' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            )}
            {isVerified && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-1">
                <FaCheckCircle /> Verified
              </span>
            )}
            {item.itemType && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                {item.itemType === 'lost' ? 'Lost Item' : 'Found Item'}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-teal-600 mb-2">Description</p>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>

          {/* Item Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</p>
              <p className="text-gray-800 font-medium">{item.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p>
              <p className="text-gray-800 font-medium">{item.location}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
              <p className="text-gray-800 font-medium">{item.dateLost ? new Date(item.dateLost).toLocaleDateString() : 'Not specified'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Posted</p>
              <p className="text-gray-800 font-medium">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</p>
            </div>
          </div>

          {/* Distinguishing Features */}
          {item.distinguishingFeatures && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Distinguishing Features</p>
              <p className="text-yellow-700">{item.distinguishingFeatures}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <p className="text-sm font-semibold text-teal-700 mb-3">Contact Information</p>
            <div className="space-y-2">
              <p className="text-sm text-teal-700">
                <strong>Name:</strong> {item.name}
              </p>
              <div className="flex items-center gap-2 text-sm text-teal-700">
                <FaEnvelope size={14} />
                <a href={`mailto:${item.email}`} className="hover:underline">{item.email}</a>
              </div>
              {item.phone && (
                <div className="flex items-center gap-2 text-sm text-teal-700">
                  <FaPhone size={14} />
                  <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {/* Claim / Response Actions */}
        {!isItemOwner && item.status !== 'recovered' && item.verificationStatus === 'verified' && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-4">
              {item.itemType === 'lost' 
                ? 'Did you find this item? Click below to claim it and provide proof.'
                : 'Is this your item? Click below to claim it and verify your ownership.'}
            </p>
            <button
              onClick={() => setShowClaimModal(true)}
              className="w-full md:w-auto px-6 py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-lg hover:shadow-xl transition font-medium"
            >
              {item.itemType === 'lost' ? 'Found This Item!' : 'Claim This Item'}
            </button>
          </div>
        )}

        {/* Owner-Only Actions */}
        {isItemOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
            <p className="text-sm font-medium text-blue-700">Item Management</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/update/${item._id}`)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow hover:shadow-md transition font-medium"
              >
                <FaEdit size={16} />
                Edit Item
              </button>
              <button
                onClick={handleDeleteItem}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow hover:shadow-md transition font-medium"
              >
                <FaTrash size={16} />
                Delete Item
              </button>
            </div>
          </div>
        )}

        {/* Recovered Status */}
        {item.status === 'recovered' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center gap-4">
            <FaCheckCircle className="text-3xl text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Item Recovered!</p>
              <p className="text-sm text-green-700">This item has been successfully recovered and returned.</p>
            </div>
          </div>
        )}
      </div>


      {/* Claim Item Modal */}
      <ClaimItemModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        itemId={item._id}
        itemTitle={item.title}
        onSuccess={() => {
          setShowClaimModal(false);
          // Optionally refresh the item data or navigate
        }}
      />

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-2xl font-semibold text-zetech-primary mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Recovery Details</h3>
            <div className="mb-4">
              <label className="block font-medium mb-2 text-zetech-primary">Recovered Location</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                value={recoveredLocation}
                onChange={(e) => setRecoveredLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2 text-zetech-primary">Recovered Date</label>
              <DatePicker
                selected={recoveredDate}
                onChange={(date) => setRecoveredDate(date)}
                className="w-full px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-zetech-primary"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2 text-zetech-primary">Recovered By</label>
              <div className="flex items-center gap-4">
                <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full" />
                <div>
                  <p>{user.displayName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button
                className="px-6 py-2 bg-gradient-to-r from-zetech-secondary to-orange-600 text-white rounded-lg shadow hover:scale-105 transition"
                onClick={handleSubmit}
                disabled={isRecovered}
              >
                Submit
              </button>
              <button
                className="ml-4 px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg shadow hover:scale-105 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
