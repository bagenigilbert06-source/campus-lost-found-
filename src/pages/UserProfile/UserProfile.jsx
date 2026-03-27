import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  FaUser,
  FaCog,
  FaClock,
  FaChartBar,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaBell,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';

const UserProfile = () => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [personalData, setPersonalData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    studentId: '',
    bio: ''
  });

  const [profileImage, setProfileImage] = useState(user?.photoURL || '');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    dailyDigest: false,
    announcements: true,
    showNamePublic: true,
    showPhonePublic: false,
    showEmailPublic: false
  });

  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({
    itemsPosted: 0,
    itemsRecovered: 0,
    claimsSubmitted: 0,
    claimsApproved: 0,
    successRate: '0%'
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileRes = await axios.get('http://localhost:3001/api/users/profile', {
        params: { email: user?.email },
        withCredentials: true
      }).catch(() => ({ data: {} }));

      if (profileRes.data) {
        setPersonalData(prev => ({
          ...prev,
          ...profileRes.data
        }));
        if (profileRes.data.profileImage) {
          setProfileImage(profileRes.data.profileImage);
        }
        if (profileRes.data.settings) {
          setSettings(prev => ({
            ...prev,
            ...profileRes.data.settings
          }));
        }
      }

      // Fetch activity log
      const activityRes = await axios.get('http://localhost:3001/api/users/activity', {
        params: { email: user?.email, limit: 10 },
        withCredentials: true
      }).catch(() => ({ data: { data: [] } }));

      setActivityLog(activityRes.data?.data || []);

      // Fetch stats
      const statsRes = await axios.get('http://localhost:3001/api/users/stats', {
        params: { email: user?.email },
        withCredentials: true
      }).catch(() => ({ data: { data: {} } }));

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('[v0] Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePersonalInfo = async () => {
    if (!personalData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put('http://localhost:3001/api/users/profile', {
        ...personalData,
        email: user?.email,
        profileImage
      }, {
        withCredentials: true
      });

      if (response.status === 200 || response.data.success) {
        toast.success('Profile updated successfully!');
        setIsEditingPersonal(false);
      }
    } catch (error) {
      console.error('[v0] Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put('http://localhost:3001/api/users/password', {
        email: user?.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });

      if (response.status === 200 || response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      }
    } catch (error) {
      console.error('[v0] Error changing password:', error);
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.put('http://localhost:3001/api/users/settings', {
        email: user?.email,
        settings
      }, {
        withCredentials: true
      });

      if (response.status === 200 || response.data.success) {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('[v0] Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <Helmet>
        <title>{`My Profile - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium"
          >
            <FaArrowLeft size={16} />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-8 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profileImage ? (
                <img src={profileImage} alt={personalData.fullName} className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-3xl text-teal-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{personalData.fullName || 'Your Profile'}</h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
              <span className="inline-block mt-3 px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                Student
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200 flex-wrap">
            {[
              { id: 'personal', label: 'Personal Info', icon: FaUser },
              { id: 'settings', label: 'Settings', icon: FaCog },
              { id: 'activity', label: 'Activity', icon: FaClock },
              { id: 'stats', label: 'Statistics', icon: FaChartBar }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none px-6 py-4 font-medium flex items-center justify-center gap-2 border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditingPersonal && (
                    <button
                      onClick={() => setIsEditingPersonal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
                    >
                      <FaEdit size={16} />
                      Edit
                    </button>
                  )}
                </div>

                {isEditingPersonal ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={personalData.fullName}
                        onChange={handlePersonalChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={personalData.phone}
                          onChange={handlePersonalChange}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={personalData.studentId}
                          onChange={handlePersonalChange}
                          placeholder="Enter your student ID"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bio (Optional)
                      </label>
                      <textarea
                        name="bio"
                        value={personalData.bio}
                        onChange={handlePersonalChange}
                        placeholder="Tell us a bit about yourself..."
                        rows="4"
                        maxLength="200"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">{personalData.bio.length}/200</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSavePersonalInfo}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition"
                      >
                        <FaSave size={16} />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditingPersonal(false)}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                      >
                        <FaTimes size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Full Name</p>
                      <p className="text-lg text-gray-900 font-medium">{personalData.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Email</p>
                      <p className="text-lg text-gray-900 font-medium">{user?.email}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Phone</p>
                      <p className="text-lg text-gray-900 font-medium">{personalData.phone || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Student ID</p>
                      <p className="text-lg text-gray-900 font-medium">{personalData.studentId || 'Not provided'}</p>
                    </div>
                    {personalData.bio && (
                      <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Bio</p>
                        <p className="text-gray-900">{personalData.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                {/* Notification Settings */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaBell className="text-teal-600" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email when item match found' },
                      { key: 'dailyDigest', label: 'Daily activity digest' },
                      { key: 'announcements', label: 'Admin announcements' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key]}
                          onChange={() => handleSettingChange(item.key)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'showNamePublic', label: 'Show my name on postings' },
                      { key: 'showPhonePublic', label: 'Show my phone number' },
                      { key: 'showEmailPublic', label: 'Show my email address' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key]}
                          onChange={() => handleSettingChange(item.key)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition flex items-center gap-2"
                >
                  <FaSave size={16} />
                  Save Settings
                </button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                {activityLog.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLog.map((activity, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-4">
                        <div className="text-teal-600 text-xl mt-1">
                          <FaCheckCircle />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.description || activity.action}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(activity.timestamp || activity.createdAt).toLocaleDateString()} at {new Date(activity.timestamp || activity.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Items Posted', value: stats.itemsPosted },
                    { label: 'Items Recovered', value: stats.itemsRecovered },
                    { label: 'Claims Submitted', value: stats.claimsSubmitted },
                    { label: 'Claims Approved', value: stats.claimsApproved }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-200">
                      <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold text-teal-600 mt-2">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {stats.successRate && (
                  <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.successRate}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
