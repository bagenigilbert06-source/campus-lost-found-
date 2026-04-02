import React, { useState, useEffect, useContext, useMemo } from "react";
import { API_BASE } from '../../utils/apiConfig.js';
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AuthContext from "./../../context/Authcontext/AuthContext";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import UseAxiosSecure from "../../Hooks/UseAxiosSecure";
import { schoolConfig } from "../../config/schoolConfig";
import {
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaEnvelope,
  FaShareAlt,
  FaExpandAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTag,
  FaUser,
} from "react-icons/fa";
import Swal from "sweetalert2";
import ClaimItemModal from "../../components/ClaimItemModal";
import ImageLightbox from "../../components/ImageLightbox";
import BookmarkButton from "../../components/BookmarkButton";


const PostDetails = () => {
  const { user } = useContext(AuthContext);
  const loaderData = useLoaderData();
  const params = useParams();
  const id = params?.id || window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const axiosSecure = UseAxiosSecure();

  const [item, setItem] = useState(loaderData || {});
  const [loading, setLoading] = useState(!loaderData);
  const [showModal, setShowModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recoveredLocation, setRecoveredLocation] = useState("");
  const [recoveredDate, setRecoveredDate] = useState("");

  useEffect(() => {
    if (!loaderData && id) {
      fetchItemDetails();
    }
  }, [id, loaderData]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/items/${id}`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data)
        ? res.data[0]
        : res.data?.data || res.data;
      setItem(data || {});
    } catch (error) {
      console.error("[PostDetails] Error fetching item:", error);
      toast.error("Failed to load item details");
      navigate("/app/search");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = item.verificationStatus === "verified";
  const isRecovered = item.status === "recovered";

  const images = useMemo(() => {
    if (item.images && item.images.length > 0) return item.images;
    if (item.image) return [item.image];
    return [];
  }, [item]);

  const isItemOwner = user && user.email === item.email;

  const handleDeleteItem = () => {
    Swal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_BASE}/items/${item._id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.deletedCount > 0 || data.success || data.message) {
              Swal.fire("Deleted!", "Your item has been deleted.", "success").then(() => {
                navigate("/app/my-items");
              });
            } else {
              Swal.fire("Error!", "Item could not be deleted.", "error");
            }
          })
          .catch((error) => {
            console.error("[PostDetails] Delete error:", error);
            Swal.fire("Error!", "An error occurred while deleting the item.", "error");
          });
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosSecure.post(
        `/items/${item._id}/claim`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        toast.success("Item marked as recovered!");
        setShowModal(false);
        fetchItemDetails();
      } else {
        toast.error("Error recovering item. Please try again.");
      }
    } catch (error) {
      console.error("[PostDetails] Error claiming item:", error);
      toast.error(error.response?.data?.message || "Error recovering item. Please try again.");
    }
  };

  const handleShare = async () => {
    const shareText = `Check out this ${item.itemType} item on ${schoolConfig.name}: ${item.title}`;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("[PostDetails] Share error:", error);
    }
  };

  const getStatusBadge = () => {
    const status = item.status || "active";

    if (status === "active") {
      return "bg-green-100 text-green-700";
    }
    if (status === "claimed" || status === "claim_in_progress") {
      return "bg-amber-100 text-amber-700";
    }
    if (status === "recovered") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const getItemTypeBadge = () => {
    const type = (item.itemType || "").toString().toLowerCase();

    if (type === "lost") return "bg-orange-100 text-orange-700";
    if (type === "found") return "bg-sky-100 text-sky-700";
    return "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8">
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm font-medium text-slate-600">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item || !item._id) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="mb-4 text-lg font-semibold text-red-600">Item not found</p>
            <button
              onClick={() => navigate("/app/search")}
              className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${item.title || "Item Details"} - ${schoolConfig.name}`}</title>
      </Helmet>

      <div className="min-h-screen bg-[#f7f8fa]">
        {/* Sticky top bar */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/app/search")}
              className="inline-flex items-center gap-2 rounded-xl text-sm font-medium text-slate-700"
            >
              <FaChevronLeft className="text-xs" />
              Back to Search
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {/* Verification banner */}
          <section
            className={`mb-6 rounded-3xl border p-5 shadow-sm sm:mb-8 sm:p-6 ${
              isVerified
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isVerified ? "bg-green-600" : "bg-amber-500"
                  }`}
                >
                  {isVerified ? (
                    <FaCheckCircle className="text-white" />
                  ) : (
                    <FaClock className="text-white" />
                  )}
                </div>

                <div>
                  <p
                    className={`font-semibold ${
                      isVerified ? "text-green-800" : "text-amber-800"
                    }`}
                  >
                    {isVerified
                      ? "Verified by Security Office"
                      : "Pending Verification"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {isVerified
                      ? "This item has been verified by the security office."
                      : "This item is awaiting verification by the security office."}
                  </p>
                </div>
              </div>

              {isVerified && item.verifiedBy && (
                <div className="text-sm text-slate-500 md:text-right">
                  <p>Verified by: {item.verifiedBy}</p>
                  {item.verifiedAt && (
                    <p>{new Date(item.verifiedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left column */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="relative mb-4 overflow-hidden rounded-3xl bg-slate-100">
                <div
                  className="relative flex h-[340px] cursor-pointer items-center justify-center md:h-[420px]"
                  onClick={() => images.length > 0 && setShowLightbox(true)}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        viewBox="0 0 300 200"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full"
                      >
                        <rect width="300" height="200" fill="#e2e8f0" />
                        <text
                          x="150"
                          y="100"
                          textAnchor="middle"
                          fontSize="18"
                          fill="#64748b"
                          fontFamily="Arial"
                        >
                          No Image Available
                        </text>
                      </svg>
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(
                            (prev) => (prev - 1 + images.length) % images.length
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white"
                        type="button"
                      >
                        <FaChevronLeft size={18} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev + 1) % images.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white"
                        type="button"
                      >
                        <FaChevronRight size={18} />
                      </button>

                      <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}

                  {images.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLightbox(true);
                      }}
                      className="absolute right-3 top-3 rounded-xl bg-white/90 p-2 text-slate-900"
                      title="Expand image"
                      type="button"
                    >
                      <FaExpandAlt size={16} />
                    </button>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${
                        idx === currentImageIndex
                          ? "border-emerald-600"
                          : "border-slate-200"
                      }`}
                      type="button"
                    >
                      <img
                        src={img}
                        alt={`${item.title} ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Right column */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {item.status && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge()}`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                )}

                {isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <FaCheckCircle />
                    Verified
                  </span>
                )}

                {item.itemType && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getItemTypeBadge()}`}
                  >
                    {item.itemType?.toLowerCase() === "lost"
                      ? "Lost Item"
                      : item.itemType?.toLowerCase() === "found"
                      ? "Found Item"
                      : item.itemType?.toLowerCase() === "recovered"
                      ? "Recovered Item"
                      : "Item"}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {item.title}
              </h1>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Description
                </p>
                <p className="text-sm leading-7 text-slate-700">{item.description}</p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailCard
                  icon={FaTag}
                  label="Category"
                  value={item.category || "Not specified"}
                />
                <DetailCard
                  icon={FaMapMarkerAlt}
                  label="Location"
                  value={item.location || "Not specified"}
                />
                <DetailCard
                  icon={FaCalendarAlt}
                  label="Date"
                  value={
                    item.dateLost
                      ? new Date(item.dateLost).toLocaleDateString()
                      : "Not specified"
                  }
                />
                <DetailCard
                  icon={FaCalendarAlt}
                  label="Posted"
                  value={
                    item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "Recently"
                  }
                />
              </div>

              {item.distinguishingFeatures && (
                <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Distinguishing Features
                  </p>
                  <p className="text-sm leading-7 text-amber-800">
                    {item.distinguishingFeatures}
                  </p>
                </div>
              )}

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Contact Information
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <FaUser className="text-slate-400" />
                    <span>{item.name || "Unknown"}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <FaEnvelope className="text-slate-400" />
                    <a href={`mailto:${item.email}`} className="hover:underline">
                      {item.email}
                    </a>
                  </div>

                  {item.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <FaPhone className="text-slate-400" />
                      <a href={`tel:${item.phone}`} className="hover:underline">
                        {item.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  type="button"
                >
                  <FaShareAlt size={14} />
                  Share Item
                </button>

                {item._id && <BookmarkButton itemId={item._id} size="md" showLabel={true} />}
              </div>
            </section>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            {!isItemOwner &&
              item.status !== "recovered" &&
              item.verificationStatus === "verified" && (
                <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 p-5 shadow-sm">
                  <p className="mb-4 text-sm leading-6 text-slate-600">
                    {item.itemType?.toLowerCase() === "lost"
                      ? "Did you find this item? Click below to claim it and provide proof."
                      : item.itemType?.toLowerCase() === "found"
                      ? "Is this your item? Click below to claim it and verify your ownership."
                      : "This item has been marked as recovered."}
                  </p>

                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white md:w-auto"
                    type="button"
                  >
                    {item.itemType?.toLowerCase() === "lost" ? "Found This Item!" : "Claim This Item"}
                  </button>
                </div>
              )}

            {isItemOwner && (
              <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-sky-800">
                  Item Management
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate(`/app/update/${item._id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"
                    type="button"
                  >
                    <FaEdit size={14} />
                    Edit Item
                  </button>

                  <button
                    onClick={handleDeleteItem}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
                    type="button"
                  >
                    <FaTrash size={14} />
                    Delete Item
                  </button>
                </div>
              </div>
            )}

            {item.status === "recovered" && (
              <div className="flex items-center gap-4 rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <FaCheckCircle className="text-3xl text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Item Recovered!</p>
                  <p className="text-sm text-green-700">
                    This item has been successfully recovered and returned.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ImageLightbox
          images={images}
          initialIndex={currentImageIndex}
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
        />

        <ClaimItemModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          itemId={item._id}
          itemTitle={item.title}
          onSuccess={() => {
            setShowClaimModal(false);
          }}
        />

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
              <h3 className="mb-6 text-2xl font-semibold text-slate-900">
                Recovery Details
              </h3>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recovered Location
                </label>
                <input
                  type="text"
                  className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-emerald-500"
                  value={recoveredLocation}
                  onChange={(e) => setRecoveredLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recovered Date
                </label>
                <input
                  type="date"
                  className="h-11 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-emerald-500"
                  value={recoveredDate}
                  onChange={(e) => setRecoveredDate(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Recovered By
                </label>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <img
                    src={user?.photoURL}
                    alt={user?.displayName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{user?.displayName}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
                  onClick={handleSubmit}
                  disabled={isRecovered}
                  type="button"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        <Icon className="text-sm" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em]">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default PostDetails;