import React, { useEffect } from "react";
import {
  FaTrash,
  FaExclamationTriangle,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

const ConfirmationDialog = ({
  isOpen = false,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm = () => {},
  onCancel = () => {},
  isDangerous = false,
  isLoading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const styles = isDangerous
    ? {
        softBg: "bg-red-50",
        softBorder: "border-red-200",
        iconWrap: "bg-red-100",
        iconColor: "text-red-600",
        confirmBtn: "bg-red-600 text-white hover:bg-red-700",
        badge: "bg-red-50 text-red-700 border-red-200",
      }
    : {
        softBg: "bg-emerald-50",
        softBorder: "border-emerald-200",
        iconWrap: "bg-emerald-100",
        iconColor: "text-emerald-700",
        confirmBtn: "bg-emerald-600 text-white hover:bg-emerald-700",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

  const Icon = isDangerous ? FaExclamationTriangle : FaCheckCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      {/* Backdrop click */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
        className="absolute inset-0 cursor-default"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div
                className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles.badge}`}
              >
                {isDangerous ? "Important Action" : "Confirmation"}
              </div>

              <h3
                id="confirmation-dialog-title"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                {title}
              </h3>
            </div>

            <button
              onClick={onCancel}
              disabled={isLoading}
              type="button"
              aria-label="Close dialog"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 disabled:opacity-50"
            >
              <FaTimes size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${styles.iconWrap}`}
            >
              <Icon className={`h-7 w-7 ${styles.iconColor}`} />
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-600 sm:text-[15px]">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:min-w-[130px]"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              type="button"
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:opacity-50 sm:min-w-[150px] ${styles.confirmBtn}`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;