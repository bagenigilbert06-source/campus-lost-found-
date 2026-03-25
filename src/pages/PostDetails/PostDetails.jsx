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
import { FaCheckCircle, FaClock, FaShieldAlt, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const PostDetails = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const item = useLoaderData();
  const navigate = useNavigate();
  const isVerified = item.verificationStatus === 'verified';
  const [showModal, setShowModal] = useState(false);
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
        <title>{item.title} - {schoolConfig.name}</title>
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
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Image Section */}
        <div className="w-full md:w-1/3 h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
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
        </div>
        <div className="flex-1">
          <p className="text-[0.9rem] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">Description:</strong> {item.description}
          </p>
          <p className="text-[0.9rem] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">Category:</strong> {item.category}
          </p>
          <p className="text-[0.9rem] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">Location:</strong> {item.location}
          </p>
          <p className="text-[0.9rem] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">Date Lost:</strong> {item.dateLost}
          </p>
          <p className="text-[0.9rem] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">Owner:</strong> {item.name}
          </p>
          <p className="text-[0.9rem] mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">Contact:</strong> {item.email}
          </p>
        </div>
      </div>

      <div className="text-center mt-6 space-y-4">
        {/* Item Recovery/Claim Actions */}
        <div>
          {item.itemType === 'lost' && !isRecovered && (
            <button
              className="px-6 py-2 text-white bg-gradient-to-r from-zetech-secondary to-orange-600 rounded-lg shadow hover:shadow-md hover:scale-105 transition disabled:opacity-50"
              onClick={() => setShowModal(true)}
            >
              Found This!
            </button>
          )}
          {item.itemType === 'Found' && !isRecovered && (
            <button
              className="px-6 py-2 text-white bg-gradient-to-r from-zetech-secondary to-orange-600 rounded-lg shadow hover:shadow-md hover:scale-105 transition disabled:opacity-50"
              onClick={() => setShowModal(true)}
            >
              This is Mine!
            </button>
          )}
          {isRecovered && (
            <button
              className="px-6 py-2 text-white bg-gray-500 rounded-lg shadow cursor-not-allowed"
              disabled
            >
              Recovered
            </button>
          )}
        </div>

        {/* Owner-Only Actions */}
        {isItemOwner && (
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(`/update/${item._id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow hover:shadow-md hover:scale-105 transition"
            >
              <FaEdit size={16} />
              Edit Item
            </button>
            <button
              onClick={handleDeleteItem}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow hover:shadow-md hover:scale-105 transition"
            >
              <FaTrash size={16} />
              Delete Item
            </button>
          </div>
        )}
      </div>


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
