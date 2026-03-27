import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheckCircle, 
  FaSpinner, 
  FaImage, 
  FaTrash,
  FaTimes 
} from 'react-icons/fa';

const PostLostItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageInput, setImageInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    itemType: '',
    description: '',
    location: '',
    dateLost: new Date().toISOString().split('T')[0],
    distinguishingFeatures: '',
    agreeToTerms: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  const categories = [
    'Electronics', 'IDs', 'Keys', 'Wallets', 'Phones', 
    'Laptops', 'Bags', 'Clothing', 'Books', 'Other'
  ];

  const itemTypes = [
    'Student ID', 'Passport', 'Phone', 'Laptop', 
    'Wallet', 'Keys', 'Backpack', 'Watch', 'Other'
  ];

  const locations = [
    'Gate 1', 'Gate 2', 'Main Building', 'Library', 
    'Cafeteria', 'Sports Complex', 'Hostel', 'Parking', 
    'Security Office', 'Classroom Building', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImageUrl = () => {
    if (!imageInput.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    if (imageUrls.length >= 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    setImageUrls([...imageUrls, imageInput]);
    setImageInput('');
  };

  const handleRemoveImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter the item title');
      return false;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (!formData.itemType) {
      toast.error('Please select an item type');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.description.trim() || formData.description.length < 20) {
      toast.error('Please provide a detailed description (at least 20 characters)');
      return false;
    }
    if (!formData.location) {
      toast.error('Please select a location');
      return false;
    }
    if (!formData.dateLost) {
      toast.error('Please select the date the item was lost');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        email: user?.email,
        name: user?.displayName,
        phone: user?.phoneNumber || '',
        itemType: 'lost',
        images: imageUrls,
        status: 'pending',
        verificationStatus: 'pending'
      };

      console.log('[v0] Submitting lost item data:', submitData);

      const response = await axios.post('http://localhost:3001/api/items', submitData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.status === 201 || response.data.success || response.data._id) {
        Swal.fire({
          title: 'Success!',
          text: 'Your lost item has been posted. The admin will verify it shortly.',
          icon: 'success',
          confirmButtonColor: '#14b8a6',
        }).then(() => {
          navigate('/app/dashboard');
        });
      }
    } catch (error) {
      console.error('[v0] Error posting lost item:', error);
      toast.error(error.response?.data?.message || 'Error posting lost item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Helmet>
        <title>{`Post Lost Item - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium"
          >
            <FaArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Report a Lost Item</h1>
          <p className="text-gray-600">Help us find your lost item by providing detailed information</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${step <= currentStep ? 'text-teal-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition ${
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <FaCheckCircle /> : step}
                </div>
                <span className="text-xs font-medium text-center">
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Details' : step === 3 ? 'Photos' : 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue Leather Wallet, Black iPhone 13"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Type *
                  </label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Type</option>
                    {itemTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description & Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <p className="text-xs text-gray-500 mb-2">Provide detailed information about the item</p>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the item in detail. Include size, color, brand, condition, etc..."
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length} characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location Lost *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date Lost *
                  </label>
                  <input
                    type="date"
                    name="dateLost"
                    value={formData.dateLost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distinguishing Features (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Any unique marks, serial numbers, or identifying features</p>
                <textarea
                  name="distinguishingFeatures"
                  value={formData.distinguishingFeatures}
                  onChange={handleInputChange}
                  placeholder="e.g., Has a scratch on corner, my initials on inside, pink sticker on back..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Photo Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Photos (Optional - Recommended)
                </label>
                <p className="text-xs text-gray-500 mb-4">Add up to 3 photos of your lost item. Use direct image URLs.</p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleAddImageUrl}
                    disabled={imageUrls.length >= 3}
                    className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    <FaImage size={16} />
                    Add Image
                  </button>
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Uploaded Images ({imageUrls.length}/3)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%239ca3af" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <button
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Title</p>
                    <p className="text-gray-800">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Category</p>
                    <p className="text-gray-800">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Type</p>
                    <p className="text-gray-800">{formData.itemType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location Lost</p>
                    <p className="text-gray-800">{formData.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date Lost</p>
                    <p className="text-gray-800">{new Date(formData.dateLost).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Photos</p>
                    <p className="text-gray-800">{imageUrls.length} image(s)</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                  <p className="text-gray-800">{formData.description}</p>
                </div>

                {formData.distinguishingFeatures && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Distinguishing Features</p>
                    <p className="text-gray-800">{formData.distinguishingFeatures}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that the information provided is accurate and true. The admin will verify this item before posting it publicly.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              <FaArrowLeft size={16} />
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 ml-auto bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
              >
                Next
                <FaArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.agreeToTerms}
                className="flex items-center gap-2 px-6 py-3 ml-auto bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Post Lost Item
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLostItem;
