import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useContext } from 'react';
import AuthContext from './../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import { schoolConfig } from '../../config/schoolConfig';
import { FaCheckCircle, FaClock, FaShieldAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PlaceholderImage from '../../components/PlaceholderImage';

const PostDetails = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const item = useLoaderData();
  const isVerified = item.verificationStatus === 'verified';
  const [showModal, setShowModal] = useState(false);
  const [recoveredLocation, setRecoveredLocation] = useState('');
  const [recoveredDate, setRecoveredDate] = useState(new Date());
  const [isRecovered, setIsRecovered] = useState(item.itemType === 'Recovered');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const axiosSecure = UseAxiosSecure();

  // Get images from images array or fallback to single image
  const images = (item.images && item.images.length > 0) ? item.images : (item.image ? [item.image] : []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
        {/* Image Carousel */}
        <div className="w-full md:w-1/3 relative group">
          <div className="relative h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg shadow-md overflow-hidden flex items-center justify-center">
            {images.length > 0 && images[currentImageIndex] ? (
              <img
                src={images[currentImageIndex]}
                alt={`${item.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.parentElement?.querySelector('[data-placeholder]')) {
                    e.target.parentElement.querySelector('[data-placeholder]').style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div data-placeholder className="w-full h-full flex items-center justify-center">
                <PlaceholderImage />
              </div>
            )}
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
              >
                <FaChevronRight size={20} />
              </button>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition ${
                      idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4">
          {/* Item Type Badge */}
          <div className="inline-block">
            <span className={`px-4 py-2 rounded-full font-bold text-white text-sm ${
              item.itemType === 'Lost' ? 'bg-red-500' :
              item.itemType === 'Found' ? 'bg-green-500' :
              'bg-blue-500'
            }`}>
              {item.itemType === 'Lost' ? '🔴' : item.itemType === 'Found' ? '🟢' : '✓'} {item.itemType}
            </span>
          </div>

          <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
            <strong className="font-semibold text-zetech-primary">📝 Description:</strong>
            <br />
            {item.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
              <strong className="font-semibold text-zetech-primary">🏷️ Category:</strong>
              <br />
              {item.category}
            </p>
            <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
              <strong className="font-semibold text-zetech-primary">📍 Location:</strong>
              <br />
              {item.location}
            </p>
            <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
              <strong className="font-semibold text-zetech-primary">📅 Date:</strong>
              <br />
              {new Date(item.dateLost || item.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
              <strong className="font-semibold text-zetech-primary">👤 Status:</strong>
              <br />
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active'}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-100 p-4 rounded-lg">
            <h3 className="font-semibold text-zetech-primary mb-2">Contact Information</h3>
            <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
              <strong>Owner:</strong> {item.name}
            </p>
            <p className="text-[0.9rem]" style={{ fontFamily: 'Lato, sans-serif' }}>
              <strong>Email:</strong> <a href={`mailto:${item.email}`} className="text-zetech-primary hover:underline">{item.email}</a>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
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
