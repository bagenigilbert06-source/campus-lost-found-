import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import auth from "../../firebase/firebase.init";
import AuthContext from "../../context/Authcontext/AuthContext";
import { Helmet } from "react-helmet-async";
import { schoolConfig } from "../../config/schoolConfig";
import toast from "react-hot-toast";
import axios from "axios";
import UseAxiosSecure from "../../Hooks/UseAxiosSecure";
import {
  FaUser,
  FaCog,
  FaClock,
  FaChartBar,
  FaEdit,
  FaSave,
  FaTimes,
  FaBell,
  FaCheckCircle,
  FaArrowLeft,
  FaCamera,
} from "react-icons/fa";
import { uploadProfilePhoto } from "../../utils/storageUtils";

const API_BASE = "http://localhost:3001/api";

const UserProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const axiosSecure = UseAxiosSecure();

  const [activeTab, setActiveTab] = useState("personal");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  const [personalData, setPersonalData] = useState({
    fullName: user?.displayName || "",
    phone: "",
    studentId: "",
    department: "",
    address: "",
    dateOfBirth: "",
    emergency_contact: "",
    emergency_phone: "",
    bio: "",
  });

  const [profileImage, setProfileImage] = useState(user?.photoURL || "");

  const [settings, setSettings] = useState({
    emailNotifications: true,
    dailyDigest: false,
    announcements: true,
    showNamePublic: true,
    showPhonePublic: false,
    showEmailPublic: false,
  });

  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({
    itemsPosted: 0,
    itemsRecovered: 0,
    claimsSubmitted: 0,
    claimsApproved: 0,
    successRate: "0%",
  });

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const profileRes = await axios
        .get(`${API_BASE}/users/profile`, {
          params: { email: user?.email },
          withCredentials: true,
        })
        .catch(() => ({ data: { data: {} } }));

      if (profileRes.data?.data) {
        const profileData = profileRes.data.data;
        setPersonalData((prev) => ({
          ...prev,
          fullName: profileData.displayName || prev.fullName,
          phone: profileData.phone || prev.phone,
          studentId: profileData.studentId || prev.studentId,
          department: profileData.department || prev.department,
          address: profileData.address || prev.address,
          dateOfBirth: profileData.dateOfBirth || prev.dateOfBirth,
          emergency_contact: profileData.emergency_contact || prev.emergency_contact,
          emergency_phone: profileData.emergency_phone || prev.emergency_phone,
          bio: profileData.bio || prev.bio,
        }));

        if (profileData.profileImage) {
          setProfileImage(profileData.profileImage);
          if (updateUserProfile) {
            updateUserProfile({ photoURL: profileData.profileImage });
          }
        }

        if (profileData.displayName) {
          if (updateUserProfile) {
            updateUserProfile({ displayName: profileData.displayName });
          }
        }

        if (profileData.settings) {
          setSettings((prev) => ({
            ...prev,
            ...profileData.settings,
          }));
        }
      }

      const activityRes = await axios
        .get(`${API_BASE}/users/activity`, {
          params: { email: user?.email, limit: 10 },
          withCredentials: true,
        })
        .catch(() => ({ data: { data: [] } }));

      setActivityLog(activityRes.data?.data || []);

      const statsRes = await axios
        .get(`${API_BASE}/users/stats`, {
          params: { email: user?.email },
          withCredentials: true,
        })
        .catch(() => ({ data: { data: {} } }));

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("[UserProfile] Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      toast.loading('Uploading new profile photo...', { id: 'photo-upload' });

      // Upload to MongoDB GridFS via backend API
      const firebaseUid = user?.uid;
      if (!firebaseUid) {
        toast.error('User authentication failed. Please log in again.', { id: 'photo-upload' });
        return;
      }
      const downloadURL = await uploadProfilePhoto(file, firebaseUid);

      // Update local state
      setProfileImage(downloadURL);

      // Update Firebase auth profile and app context
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
      }
      if (updateUserProfile) {
        updateUserProfile({ photoURL: downloadURL });
      }

      // Save to database
      await axiosSecure.put(
        `/users/profile`,
        {
          ...personalData,
          email: user?.email,
          profileImage: downloadURL,
        }
      );

      toast.dismiss('photo-upload');
      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.dismiss('photo-upload');
      toast.error(error.message || 'Error uploading image');
    } finally {
      setImageLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSettingChange = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSavePersonalInfo = async () => {
    if (!personalData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.put(
        `/users/profile`,
        {
          ...personalData,
          email: user?.email,
          profileImage,
        }
      );

      if (response.status === 200 || response.data.success) {
        // Update Firebase auth profile and context with new display name
        if (auth?.currentUser && personalData.fullName) {
          await updateProfile(auth.currentUser, { displayName: personalData.fullName });
        }
        if (updateUserProfile) {
          updateUserProfile({ displayName: personalData.fullName, photoURL: profileImage });
        }

        toast.success("Profile updated successfully");
        setIsEditingPersonal(false);
      }
    } catch (error) {
      console.error("[UserProfile] Error updating profile:", error);
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await axiosSecure.put(
        `/users/settings`,
        {
          email: user?.email,
          settings,
        }
      );

      if (response.status === 200 || response.data.success) {
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      console.error("[UserProfile] Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const initials = useMemo(() => {
    if (personalData.fullName?.trim()) {
      const names = personalData.fullName.trim().split(" ");
      if (names.length === 1) return names[0][0]?.toUpperCase() || "U";
      return `${names[0][0] || ""}${names[1][0] || ""}`.toUpperCase();
    }

    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }

    return "U";
  }, [personalData.fullName, user]);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: FaUser },
    { id: "settings", label: "Settings", icon: FaCog },
    { id: "activity", label: "Activity", icon: FaClock },
    { id: "stats", label: "Statistics", icon: FaChartBar },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <Helmet>
        <title>{`My Profile - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/app/dashboard")}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          <FaArrowLeft className="text-sm" />
          Back to Dashboard
        </button>

        <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-5 shadow-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <button
                onClick={handleImageClick}
                disabled={imageLoading}
                className="group relative h-24 w-24 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl bg-white text-2xl font-bold text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400 transition-all duration-200 disabled:opacity-60"
                title="Click to change profile photo"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={personalData.fullName || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
                
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <FaCamera className="text-white text-2xl" />
                </div>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                {personalData.fullName || "Your Profile"}
              </h1>
              <p className="mt-1 truncate text-sm text-emerald-800/90 sm:text-base">
                {user?.email}
              </p>
              <div className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                Student Account
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-3 py-2 sm:px-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                      active
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="text-sm" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === "personal" && (
              <div>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Personal Information
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Manage your profile details and account information.
                    </p>
                  </div>

                  {!isEditingPersonal && (
                    <button
                      onClick={() => setIsEditingPersonal(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <FaEdit className="text-sm" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditingPersonal ? (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={personalData.fullName}
                        onChange={handlePersonalChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={personalData.phone}
                          onChange={handlePersonalChange}
                          placeholder="Enter your phone number"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={personalData.studentId}
                          onChange={handlePersonalChange}
                          placeholder="Enter your student ID"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Department/Faculty
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={personalData.department}
                          onChange={handlePersonalChange}
                          placeholder="e.g., Engineering, Commerce"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={personalData.dateOfBirth}
                          onChange={handlePersonalChange}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={personalData.address}
                        onChange={handlePersonalChange}
                        placeholder="Enter your residential address"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergency_contact"
                          value={personalData.emergency_contact}
                          onChange={handlePersonalChange}
                          placeholder="Full name"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Emergency Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="emergency_phone"
                          value={personalData.emergency_phone}
                          onChange={handlePersonalChange}
                          placeholder="Phone number"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={personalData.bio}
                        onChange={handlePersonalChange}
                        placeholder="Tell us a bit about yourself..."
                        rows="4"
                        maxLength="200"
                        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {personalData.bio.length}/200
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={handleSavePersonalInfo}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        <FaSave className="text-sm" />
                        Save Changes
                      </button>

                      <button
                        onClick={() => setIsEditingPersonal(false)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                      >
                        <FaTimes className="text-sm" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoCard label="Full Name" value={personalData.fullName || "Not provided"} />
                    <InfoCard label="Email" value={user?.email || "Not provided"} />
                    <InfoCard label="Phone" value={personalData.phone || "Not provided"} />
                    <InfoCard label="Student ID" value={personalData.studentId || "Not provided"} />
                    <InfoCard label="Department" value={personalData.department || "Not provided"} />
                    <InfoCard label="Date of Birth" value={personalData.dateOfBirth ? new Date(personalData.dateOfBirth).toLocaleDateString() : "Not provided"} />
                    {personalData.address && (
                      <div className="md:col-span-2">
                        <InfoCard label="Address" value={personalData.address} />
                      </div>
                    )}
                    {personalData.emergency_contact && (
                      <InfoCard label="Emergency Contact" value={personalData.emergency_contact} />
                    )}
                    {personalData.emergency_phone && (
                      <InfoCard label="Emergency Phone" value={personalData.emergency_phone} />
                    )}
                    {personalData.bio ? (
                      <div className="md:col-span-2">
                        <InfoCard label="Bio" value={personalData.bio} />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Account Settings
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your notifications and privacy preferences.
                  </p>
                </div>

                <SettingsCard
                  title="Notification Preferences"
                  icon={<FaBell className="text-emerald-600" />}
                  items={[
                    {
                      key: "emailNotifications",
                      label: "Email when item match found",
                    },
                    {
                      key: "dailyDigest",
                      label: "Daily activity digest",
                    },
                    {
                      key: "announcements",
                      label: "Admin announcements",
                    },
                  ]}
                  settings={settings}
                  onToggle={handleSettingChange}
                />

                <SettingsCard
                  title="Privacy Settings"
                  items={[
                    {
                      key: "showNamePublic",
                      label: "Show my name on postings",
                    },
                    {
                      key: "showPhonePublic",
                      label: "Show my phone number",
                    },
                    {
                      key: "showEmailPublic",
                      label: "Show my email address",
                    },
                  ]}
                  settings={settings}
                  onToggle={handleSettingChange}
                />

                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <FaSave className="text-sm" />
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent Activity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest actions and updates from your account.
                  </p>
                </div>

                {activityLog.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                    No activity yet
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {activityLog.map((activity, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 px-4 py-4 sm:px-5 ${
                          idx !== activityLog.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <FaCheckCircle />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">
                            {activity.description || activity.action}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(
                              activity.timestamp || activity.createdAt
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              activity.timestamp || activity.createdAt
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Your Statistics
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    A quick view of your account performance and activity.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Items Posted", value: stats.itemsPosted },
                    { label: "Items Recovered", value: stats.itemsRecovered },
                    { label: "Claims Submitted", value: stats.claimsSubmitted },
                    { label: "Claims Approved", value: stats.claimsApproved },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-emerald-700">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {stats.successRate ? (
                  <div className="mt-4 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Success Rate
                    </p>
                    <p className="mt-3 text-3xl font-bold text-green-700">
                      {stats.successRate}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-base font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SettingsCard({ title, icon, items, settings, onToggle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon ? icon : null}
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200"
          >
            <input
              type="checkbox"
              checked={settings[item.key]}
              onChange={() => onToggle(item.key)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default UserProfile;