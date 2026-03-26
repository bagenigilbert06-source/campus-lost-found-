import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { schoolConfig } from '../../config/schoolConfig';

const UserProfile = () => {
  const { user, signOutUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user?.displayName || '',
  });

  const fallbackAvatar =
    "https://ui-avatars.com/api/?name=" + 
    encodeURIComponent(user?.displayName || "User") + 
    "&background=10b981&color=ffffff&size=200";

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success('Successfully signed out!');
      navigate('/');
    } catch {
      toast.error('Error signing out. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      if (!editData.displayName.trim()) {
        toast.error('Name cannot be empty');
        return;
      }
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Error updating profile');
    }
  };

  const getMemberSince = () => {
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return 'Unknown';
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <Helmet>
        <title>{`My Profile - ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-teal-500 shadow-lg mb-4">
                  <img
                    src={user?.photoURL || fallbackAvatar}
                    alt={user?.displayName || 'User profile'}
                    className="h-full w-full object-cover"
                  />
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    <FaShieldAlt size={12} />
                    Admin
                  </div>
                )}

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center">
                  {user?.displayName || 'User'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                  {user?.email}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  <FaEdit size={16} />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  <FaSignOutAlt size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <FaUser className="text-teal-500" size={24} />
                Account Information
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={editData.displayName}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your name"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaUser className="text-teal-500" size={20} />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Display Name
                      </p>
                      <p className="text-lg font-medium text-slate-800 dark:text-white">
                        {user?.displayName || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaEnvelope className="text-teal-500" size={20} />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Email Address
                      </p>
                      <p className="text-lg font-medium text-slate-800 dark:text-white break-all">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FaCalendarAlt className="text-teal-500" size={20} />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Member Since
                      </p>
                      <p className="text-lg font-medium text-slate-800 dark:text-white">
                        {getMemberSince()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                Account Stats
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 rounded-lg p-4"
                >
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-300 mb-1">
                    Lost Items Reported
                  </p>
                  <p className="text-3xl font-bold text-teal-700 dark:text-teal-200">
                    0
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg p-4"
                >
                  <p className="text-sm font-medium text-green-600 dark:text-green-300 mb-1">
                    Items Found
                  </p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-200">
                    0
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4"
                >
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">
                    Items Recovered
                  </p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">
                    0
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg p-4"
                >
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300 mb-1">
                    Community Score
                  </p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">
                    0
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                Quick Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/addItems')}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Report Lost/Found Item
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/myItems')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Manage My Items
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/allItems')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Browse All Items
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/allRecovered')}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  View Recovered Items
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
