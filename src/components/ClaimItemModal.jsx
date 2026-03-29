import React, { useState, useContext, useEffect } from "react";
import {
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaShieldAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import AuthContext from "../context/Authcontext/AuthContext";
import UseAxiosSecure from "../Hooks/UseAxiosSecure";

const ClaimItemModal = ({ isOpen, onClose, itemId, itemTitle, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    claimantName: user?.displayName || "",
    claimantEmail: user?.email || "",
    claimantPhone: "",
    claimantStudentId: "",
    proofOfOwnership: "",
    claimNotes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        claimantName: user?.displayName || "",
        claimantEmail: user?.email || "",
        claimantPhone: "",
        claimantStudentId: "",
        proofOfOwnership: "",
        claimNotes: "",
      });
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      claimantName: user?.displayName || "",
      claimantEmail: user?.email || "",
      claimantPhone: "",
      claimantStudentId: "",
      proofOfOwnership: "",
      claimNotes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.claimantName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.claimantEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!formData.claimantPhone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!formData.claimantStudentId.trim()) {
      toast.error("Please enter your student ID");
      return;
    }

    if (!formData.proofOfOwnership.trim() || formData.proofOfOwnership.length < 10) {
      toast.error("Please provide detailed proof of ownership");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosSecure.post("/claims", {
        itemId,
        itemTitle,
        claimantEmail: formData.claimantEmail,
        claimantName: formData.claimantName,
        claimantPhone: formData.claimantPhone,
        claimantStudentId: formData.claimantStudentId,
        proofOfOwnership: formData.proofOfOwnership,
        claimNotes: formData.claimNotes,
      });

      if (response.status === 201 || response.data.success) {
        toast.success("Claim submitted successfully! Admin will review it soon.");
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("[ClaimItemModal] Claim submission error:", error);
      toast.error(
        error.response?.data?.message || "Error submitting claim. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-3 sm:p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  <FaShieldAlt className="text-[11px]" />
                  Secure Claim Request
                </div>

                <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Claim Item
                </h2>

                <p className="mt-1 truncate text-sm text-slate-600">
                  {itemTitle || "Selected Item"}
                </p>
              </div>

              <button
                onClick={handleClose}
                disabled={loading}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 disabled:opacity-50"
                type="button"
                aria-label="Close claim modal"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="hide-scrollbar max-h-[85vh] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {/* Notice */}
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-800">
                Please provide accurate and clear details. Claims are reviewed before
                approval to confirm rightful ownership.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section title */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                  Claim Information
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in your details below so the admin team can verify your claim.
                </p>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputField
                  label="Full Name *"
                  icon={FaUser}
                  type="text"
                  name="claimantName"
                  value={formData.claimantName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                />

                <InputField
                  label="Email *"
                  icon={FaEnvelope}
                  type="email"
                  name="claimantEmail"
                  value={formData.claimantEmail}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                />

                <InputField
                  label="Phone Number *"
                  icon={FaPhone}
                  type="tel"
                  name="claimantPhone"
                  value={formData.claimantPhone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />

                <InputField
                  label="Student ID *"
                  icon={FaIdCard}
                  type="text"
                  name="claimantStudentId"
                  value={formData.claimantStudentId}
                  onChange={handleChange}
                  placeholder="Enter your student ID"
                  disabled={loading}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Proof of Ownership *
                </label>
                <p className="mb-3 text-xs leading-5 text-slate-500 sm:text-sm">
                  Describe details that prove this item belongs to you, such as
                  color, marks, stickers, serial numbers, documents inside, scratches,
                  or any unique feature.
                </p>
                <div className="relative">
                  <FaFileAlt className="pointer-events-none absolute left-4 top-4 text-slate-400" />
                  <textarea
                    name="proofOfOwnership"
                    value={formData.proofOfOwnership}
                    onChange={handleChange}
                    placeholder="Example: It has my initials inside, a blue sticker on the back, and a scratch near the corner..."
                    rows="5"
                    disabled={loading}
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-500 disabled:bg-slate-100"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {formData.proofOfOwnership.length} characters
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Additional Notes
                </label>
                <textarea
                  name="claimNotes"
                  value={formData.claimNotes}
                  onChange={handleChange}
                  placeholder="Add any extra information that may help verify your ownership..."
                  rows="4"
                  disabled={loading}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 disabled:bg-slate-100"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 disabled:opacity-50 sm:min-w-[140px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-50 sm:min-w-[180px]"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Submit Claim
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const InputField = ({
  label,
  icon: Icon,
  type,
  name,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-500 disabled:bg-slate-100"
        />
      </div>
    </div>
  );
};

export default ClaimItemModal;