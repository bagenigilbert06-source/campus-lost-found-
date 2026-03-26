import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import {
  FaUser,
  FaLock,
  FaBell,
  FaSave
} from 'react-icons/fa';
import AdminContainer from '../../components/admin/AdminContainer';

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newItemAlerts: true,
    claimNotifications: true,
    messageNotifications: true
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In a real app, you'd send this to your backend
      toast.success('Profile updated successfully');
      setLoading(false);
    } catch (error) {
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd send this to your backend
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to change password');
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, you'd save this to your backend
      toast.success('Notification settings updated');
      setLoading(false);
    } catch (error) {
      toast.error('Failed to update settings');
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Settings | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your admin profile, security, and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-zetech-primary text-zetech-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaUser className="inline mr-2" size={14} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'password'
                ? 'border-zetech-primary text-zetech-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaLock className="inline mr-2" size={14} />
            Password
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'notifications'
                ? 'border-zetech-primary text-zetech-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaBell className="inline mr-2" size={14} />
            Notifications
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>

              <div className="space-y-6">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-zetech-primary flex items-center justify-center text-white text-2xl font-bold">
                      {user?.displayName?.charAt(0) || 'A'}
                    </div>
                    <button className="btn btn-outline btn-sm">Change Photo</button>
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-gray-500 mt-2">This email is associated with your account</p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value="Security Officer"
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-2">Your account role cannot be changed</p>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="btn btn-primary bg-zetech-primary hover:bg-zetech-dark border-0 text-white"
                  >
                    <FaSave size={14} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
              <p className="text-gray-600 mb-6">
                Ensure your account is using a secure password. Change your password regularly to maintain security.
              </p>

              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                    placeholder="Enter current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                    placeholder="Enter new password (min. 8 characters)"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                    placeholder="Confirm new password"
                  />
                </div>

                {/* Update Button */}
                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="btn btn-primary bg-zetech-primary hover:bg-zetech-dark border-0 text-white"
                  >
                    <FaLock size={14} /> {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <p className="text-gray-600 mb-8">
                Manage how you receive notifications about items, claims, and messages.
              </p>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                    className="mt-1 w-5 h-5 accent-zetech-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="font-medium text-gray-900 cursor-pointer">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive email notifications for important updates
                    </p>
                  </div>
                </div>

                {/* New Item Alerts */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="newItemAlerts"
                    checked={notifications.newItemAlerts}
                    onChange={handleNotificationChange}
                    className="mt-1 w-5 h-5 accent-zetech-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="font-medium text-gray-900 cursor-pointer">
                      New Item Alerts
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified when new items are reported
                    </p>
                  </div>
                </div>

                {/* Claim Notifications */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="claimNotifications"
                    checked={notifications.claimNotifications}
                    onChange={handleNotificationChange}
                    className="mt-1 w-5 h-5 accent-zetech-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="font-medium text-gray-900 cursor-pointer">
                      Claim Notifications
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Be notified about new item claims
                    </p>
                  </div>
                </div>

                {/* Message Notifications */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="messageNotifications"
                    checked={notifications.messageNotifications}
                    onChange={handleNotificationChange}
                    className="mt-1 w-5 h-5 accent-zetech-primary cursor-pointer"
                  />
                  <div className="flex-1">
                    <label className="font-medium text-gray-900 cursor-pointer">
                      Message Notifications
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive alerts for new messages
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="btn btn-primary bg-zetech-primary hover:bg-zetech-dark border-0 text-white"
                  >
                    <FaSave size={14} /> {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminContainer>
    </>
  );
};

export default AdminSettings;
