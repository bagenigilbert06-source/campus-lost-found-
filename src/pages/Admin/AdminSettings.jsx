import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  FiSave,
  FiBell,
  FiShield,
  FiDatabase,
  FiMail,
  FiToggle2,
} from 'react-icons/fi';
import { AuthContext } from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    maintenanceMode: false,
    autoVerification: false,
    verificationRequired: true,
    maxItemsPerUser: 50,
    itemExpiryDays: 90,
    maxImageSize: 5,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call - replace with actual API call when available
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{`Settings | ${schoolConfig.name} Admin`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Configure platform settings and preferences</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Notifications Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <FiBell className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiMail className="text-slate-600" size={18} />
                <div>
                  <p className="font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-600">Receive email alerts for platform events</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="w-5 h-5 rounded border-slate-300 accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiBell className="text-slate-600" size={18} />
                <div>
                  <p className="font-medium text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-600">Receive browser push notifications</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="w-5 h-5 rounded border-slate-300 accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <FiShield className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold text-slate-900">Verification</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiToggle2 className="text-slate-600" size={18} />
                <div>
                  <p className="font-medium text-slate-900">Verification Required</p>
                  <p className="text-sm text-slate-600">Require admin approval before items are visible</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.verificationRequired}
                onChange={() => handleToggle('verificationRequired')}
                className="w-5 h-5 rounded border-slate-300 accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiToggle2 className="text-slate-600" size={18} />
                <div>
                  <p className="font-medium text-slate-900">Auto Verification</p>
                  <p className="text-sm text-slate-600">Automatically verify items after submission</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoVerification}
                onChange={() => handleToggle('autoVerification')}
                className="w-5 h-5 rounded border-slate-300 accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* System Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <FiDatabase className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-slate-900">System</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FiToggle2 className="text-slate-600" size={18} />
                <div>
                  <p className="font-medium text-slate-900">Maintenance Mode</p>
                  <p className="text-sm text-slate-600">Disable platform access for all users</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleToggle('maintenanceMode')}
                className="w-5 h-5 rounded border-slate-300 accent-blue-600"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block mb-2">
                <p className="font-medium text-slate-900 mb-2">Max Items Per User</p>
                <input
                  type="number"
                  value={settings.maxItemsPerUser}
                  onChange={(e) =>
                    handleInputChange('maxItemsPerUser', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block mb-2">
                <p className="font-medium text-slate-900 mb-2">Item Expiry (Days)</p>
                <input
                  type="number"
                  value={settings.itemExpiryDays}
                  onChange={(e) =>
                    handleInputChange('itemExpiryDays', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block mb-2">
                <p className="font-medium text-slate-900 mb-2">Max Image Size (MB)</p>
                <input
                  type="number"
                  value={settings.maxImageSize}
                  onChange={(e) =>
                    handleInputChange('maxImageSize', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiSave size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
