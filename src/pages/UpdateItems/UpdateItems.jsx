import React, { useContext, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaImage,
  FaSave,
  FaTrash,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";

import AuthContext from "../../context/Authcontext/AuthContext";
import { schoolConfig } from "../../config/schoolConfig";
import { itemsService } from "../../services/apiService";

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

const MAX_IMAGES = 5;

// Helper function to safely extract date in yyyy-MM-dd format
const formatDateForInput = (dateValue) => {
  if (!dateValue) return new Date().toISOString().split("T")[0];
  if (typeof dateValue === 'string') {
    // If it's already in yyyy-MM-dd format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    // If it's an ISO string, extract the date part
    if (dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
  }
  return new Date().toISOString().split("T")[0];
};

const UpdateItems = () => {
  const item = useLoaderData();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const {
    _id,
    itemType: initialItemType = "Lost",
    subType: initialSubType = "",
    title: initialTitle = "",
    description: initialDescription = "",
    category: initialCategory = "Other",
    location: initialLocation = "Other",
    dateLost: initialDateLost = new Date().toISOString().split("T")[0],
    images,
    image,
    distinguishingFeatures: initialFeatures = "",
  } = item || {};

  const initialImageUrls = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) return images;
    if (image) return [image];
    return [];
  }, [images, image]);

  const [formData, setFormData] = useState({
    itemType: initialItemType,
    subType: initialSubType,
    title: initialTitle,
    description: initialDescription,
    category: initialCategory,
    location: initialLocation,
    dateLost: formatDateForInput(initialDateLost),
    distinguishingFeatures: initialFeatures,
  });

  const [imageUrls, setImageUrls] = useState(initialImageUrls);
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (imageUrls.includes(trimmed)) {
      toast.error("This image has already been added");
      return;
    }

    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setImageUrls((prev) => [...prev, trimmed]);
    setImageInput("");
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }

    // Validate date format
    if (!formData.dateLost || !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateLost)) {
      toast.error("Date must be in the required format yyyy-MM-dd");
      return;
    }

    if (imageUrls.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    const updatedItem = {
      itemType: formData.itemType,
      subType: formData.subType,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      location: formData.location.trim(),
      dateLost: formData.dateLost,
      distinguishingFeatures: formData.distinguishingFeatures.trim(),
      images: imageUrls,
    };

    try {
      setLoading(true);

      const updated = await itemsService.updateItem(_id, updatedItem);
      console.log("[UpdateItems] Update response:", updated);

      if (updated?.success || updated?._id || updated?.modifiedCount > 0) {
        toast.success("Item updated successfully!");
        navigate("/app/my-items");
      } else {
        toast.error("Item update failed");
      }
    } catch (error) {
      console.error("[UpdateItems] Update request error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Error updating item. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-6 md:py-10">
      <Helmet>
        <title>{`Update Item - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/app/my-items")}
          className="btn btn-ghost btn-sm mb-4 gap-2"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Update Item Details
          </h1>
          <p className="mt-2 text-sm text-base-content/70 md:text-base">
            Edit the item information and keep the details accurate.
          </p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="rounded-3xl border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="grid gap-0 lg:grid-cols-3">
            <div className="border-b border-base-300 p-5 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-7">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Post Type</span>
                    </label>
                    <select
                      name="itemType"
                      value={formData.itemType}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      <option value="Lost">Lost</option>
                      <option value="Found">Found</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Category</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Item Sub-Type
                      </span>
                    </label>
                    <select
                      name="subType"
                      value={formData.subType}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      <option value="">Select subtype</option>
                      {itemTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Date Lost</span>
                    </label>
                    <input
                      type="date"
                      name="dateLost"
                      value={formData.dateLost}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Title</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter item title"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Location</span>
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the item clearly"
                    className="textarea textarea-bordered min-h-[120px] w-full"
                    required
                  />
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
                    onChange={handleChange}
                    placeholder="Unique marks, serial number, color details, sticker, scratches..."
                    className="textarea textarea-bordered min-h-[100px] w-full"
                  />
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FaImage className="text-base-content/70" />
                    <p className="font-semibold">Images</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      className="input input-bordered flex-1"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="btn btn-primary"
                    >
                      Add Image
                    </button>
                  </div>

                  {imageUrls.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {imageUrls.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e2e8f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="10"%3EInvalid%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="flex items-center justify-between p-2">
                            <span className="truncate text-xs text-base-content/70">
                              Image {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="btn btn-ghost btn-xs text-error"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center text-sm text-base-content/50">
                      No images added yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 lg:p-7">
              <div className="sticky top-6 space-y-5">
                <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-base-content/70" />
                    <h3 className="font-semibold">Account Info</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Email
                      </p>
                      <input
                        type="text"
                        value={user?.email || ""}
                        readOnly
                        className="input input-bordered w-full"
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Name
                      </p>
                      <input
                        type="text"
                        value={user?.displayName || ""}
                        readOnly
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <h3 className="mb-4 font-semibold">Quick Summary</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-base-content/60">Post Type</span>
                      <span className="font-medium">{formData.itemType}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-base-content/60">Category</span>
                      <span className="font-medium">{formData.category}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-base-content/60">Images</span>
                      <span className="font-medium">{imageUrls.length}</span>
                    </div>

                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Update Item
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateItems;