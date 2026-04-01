import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getIdToken } from "firebase/auth";
import auth from "../../firebase/firebase.init";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaImage,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

import AuthContext from "../../context/Authcontext/AuthContext";
import { schoolConfig } from "../../config/schoolConfig";

const MAX_IMAGES = 3;
const API_URL = (import.meta.env.VITE_API_URL || '/api') + '/items';

const categories = [
  "Electronics",
  "IDs",
  "Keys",
  "Wallets",
  "Phones",
  "Laptops",
  "Bags",
  "Clothing",
  "Books",
  "Other",
];

const itemTypes = [
  "Student ID",
  "Passport",
  "Phone",
  "Laptop",
  "Wallet",
  "Keys",
  "Backpack",
  "Watch",
  "Other",
];

const locations = [
  "Gate 1",
  "Gate 2",
  "Main Building",
  "Library",
  "Cafeteria",
  "Sports Complex",
  "Hostel",
  "Parking",
  "Security Office",
  "Classroom Building",
  "Other",
];

const steps = [
  { id: 1, title: "Basic Info", icon: <FaClipboardList /> },
  { id: 2, title: "Details", icon: <FaMapMarkerAlt /> },
  { id: 3, title: "Photos", icon: <FaImage /> },
  { id: 4, title: "Review", icon: <FaShieldAlt /> },
];

const initialFormData = {
  title: "",
  category: "",
  postType: "Lost", // Lost, Found (Recovered is admin-only in backend)
  itemType: "", // sub-type (e.g., Student ID, Passport)
  description: "",
  location: "",
  dateLost: new Date().toISOString().split("T")[0],
  distinguishingFeatures: "",
  agreeToTerms: false,
};

const AdminAddItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!user) {
      navigate("/admin-login");
    }
  }, [user, navigate]);

  const progress = useMemo(
    () => (currentStep / steps.length) * 100,
    [currentStep]
  );

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isValidImageUrl = (url) => {
    try {
      const parsed = new URL(url);
      return /^https?:$/.test(parsed.protocol);
    } catch {
      return false;
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageInput.trim();

    if (!trimmed) {
      toast.error("Please enter an image URL");
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      toast.error("Please enter a valid image URL");
      return;
    }

    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    if (imageUrls.includes(trimmed)) {
      toast.error("This image has already been added");
      return;
    }

    setImageUrls((prev) => [...prev, trimmed]);
    setImageInput("");
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter the item title");
      return false;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }

    if (!formData.postType || !['Lost', 'Found'].includes(formData.postType)) {
      toast.error("Please select a valid post type (Lost or Found)");
      return false;
    }

    if (!formData.itemType) {
      toast.error("Please select an item type");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return false;
    }

    if (!formData.location) {
      toast.error("Please select a location");
      return false;
    }

    if (!formData.dateLost) {
      toast.error("Please select the date the item was lost");
      return false;
    }

    return true;
  };

  const validateStep4 = () => {
    if (!formData.agreeToTerms) {
      toast.error("Please agree before submitting");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep < steps.length) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const token = await getIdToken(currentUser);
      if (!token) {
        throw new Error('Failed to acquire auth token');
      }

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location,
        dateLost: formData.dateLost,
        itemType: formData.postType, // Lost/Found
        postType: formData.postType,
        subType: formData.itemType,
        distinguishingFeatures: formData.distinguishingFeatures?.trim(),
        images: imageUrls,
        email: user?.email?.toLowerCase() || "",
        name: user?.displayName || "",
        phone: user?.phoneNumber || "",
        isAdminPosted: true, // Mark as admin-posted
      };

      const response = await axios.post(API_URL, submitData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 201 || response.data?.success || response.data?._id) {
        await Swal.fire({
          title: "Success!",
          text: "The item has been posted successfully and is now live on the platform.",
          icon: "success",
          confirmButtonColor: "#0f766e",
        });

        navigate("/admin");
      } else {
        toast.error("Unable to post item. Please try again.");
      }
    } catch (error) {
      console.error("Error posting item:", error);
      toast.error(
        error?.response?.data?.message || "Error posting item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const StepBadge = ({ step }) => {
    const isActive = currentStep === step.id;
    const isDone = currentStep > step.id;

    return (
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
            isDone
              ? "border-success bg-success text-success-content"
              : isActive
              ? "border-primary bg-primary text-primary-content"
              : "border-base-300 bg-base-200 text-base-content/60",
          ].join(" ")}
        >
          {isDone ? <FaCheck size={12} /> : step.icon}
        </div>

        <div className="hidden sm:block">
          <p
            className={[
              "text-sm font-semibold",
              isActive || isDone ? "text-base-content" : "text-base-content/50",
            ].join(" ")}
          >
            {step.title}
          </p>
        </div>
      </div>
    );
  };

  const InfoRow = ({ label, value, full = false }) => (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
        {label}
      </p>
      <p className="text-sm leading-6 text-base-content">{value || "-"}</p>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-5">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Item Title *</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Black iPhone 13, Blue Backpack"
              className="input input-bordered w-full"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Post Type *</span>
              </label>
              <select
                name="postType"
                value={formData.postType}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category *</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Item Type *</span>
              </label>
              <select
                name="itemType"
                value={formData.itemType}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="">Select item type</option>
                {itemTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="space-y-5">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description *</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe the item clearly so it can be identified easily"
              className="textarea textarea-bordered w-full"
            />
            <label className="label">
              <span className="label-text-alt">
                {formData.description.length} characters
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Location Lost *</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="select select-bordered w-full"
              >
                <option value="">Select location</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Date Lost *</span>
              </label>
              <input
                type="date"
                name="dateLost"
                value={formData.dateLost}
                onChange={handleInputChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Distinguishing Features
              </span>
            </label>
            <textarea
              name="distinguishingFeatures"
              value={formData.distinguishingFeatures}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g. scratch on the back, sticker, initials, unique marks"
              className="textarea textarea-bordered w-full"
            />
          </div>
        </div>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
            <p className="text-sm text-base-content/70">
              Add up to {MAX_IMAGES} image URLs to help identify the item.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="input input-bordered flex-1"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              disabled={imageUrls.length >= MAX_IMAGES}
              className="btn btn-primary"
            >
              <FaImage />
              Add Image
            </button>
          </div>

          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {imageUrls.map((url, index) => (
                <div
                  key={url}
                  className="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
                >
                  <div className="h-44 bg-base-200">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-base-content/70">
                      Image {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="btn btn-sm btn-ghost text-error"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-sm text-base-content/50">
              No images added yet
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
          <h3 className="mb-5 text-lg font-bold text-base-content">
            Review Your Submission
          </h3>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoRow label="Title" value={formData.title} />
            <InfoRow label="Category" value={formData.category} />
            <InfoRow label="Post Type" value={formData.postType} />
            <InfoRow label="Item Sub-type" value={formData.itemType} />
            <InfoRow label="Location" value={formData.location} />
            <InfoRow
              label="Date Lost"
              value={new Date(formData.dateLost).toLocaleDateString()}
            />
            <InfoRow label="Images" value={`${imageUrls.length} image(s)`} />
            <InfoRow label="Description" value={formData.description} full />
            {formData.distinguishingFeatures ? (
              <InfoRow
                label="Distinguishing Features"
                value={formData.distinguishingFeatures}
                full
              />
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="checkbox checkbox-primary mt-0.5"
            />
            <span className="text-sm leading-6 text-base-content/80">
              I confirm that the information provided is accurate and true. This
              item will be posted directly to the platform.
            </span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-6 md:py-10">
      <Helmet>
        <title>{`Add Item - ${schoolConfig.name} Admin`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="btn btn-ghost btn-sm mb-4 gap-2"
        >
          <FaArrowLeft />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Add {formData.postType || 'Lost'} Item
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Fill in the details below to add a new item to the platform.
          </p>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
          <div className="p-5 md:p-7">
            <div className="mb-8">
              <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {steps.map((step) => (
                  <StepBadge key={step.id} step={step} />
                ))}
              </div>

              <progress
                className="progress progress-primary h-2 w-full"
                value={progress}
                max="100"
              />
            </div>

            {renderStepContent()}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-base-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="btn btn-outline"
              >
                <FaArrowLeft />
                Back
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary sm:ml-auto"
                >
                  Next
                  <FaArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.agreeToTerms}
                  className="btn btn-success sm:ml-auto"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Add {formData.postType || 'Lost'} Item
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddItem;
