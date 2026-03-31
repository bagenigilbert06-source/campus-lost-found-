import React, { useState, useEffect, useContext, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import { schoolConfig } from "../../config/schoolConfig";
import { claimsService, messagesService } from "../../services/apiService";
import {
  FaEnvelope,
  FaReply,
  FaCheck,
  FaUserCheck,
  FaBan,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaComments,
  FaInbox,
  FaArrowRight,
} from "react-icons/fa";
import AdminContainer from "../../components/admin/AdminContainer";
import EmptyState from "../../components/admin/EmptyState";
import LoadingState from "../../components/admin/LoadingState";

const claimStatuses = [
  "all",
  "pending",
  "approved",
  "rejected",
  "needs_more_proof",
];

const AdminClaims = () => {
  const { user } = useContext(AuthContext);

  const [claims, setClaims] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    // Initial load shows spinner once.
    fetchAllData(true);

    // Periodic refresh in background without forcing full page loading state.
    const interval = setInterval(() => fetchAllData(false), 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      await Promise.all([fetchClaims(), fetchMessages()]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await claimsService.getClaims();
      const claimList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setClaims(claimList);

      if (!selectedClaim && claimList.length > 0) {
        setSelectedClaim(claimList[0]);
      } else if (selectedClaim) {
        const updated = claimList.find((claim) => claim._id === selectedClaim._id);
        if (updated) setSelectedClaim(updated);
      }
    } catch (error) {
      console.error("[AdminClaims] Error fetching claims:", error);
      toast.error("Failed to load claims");
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await messagesService.getMessages({ role: "admin" });
      const messageList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setMessages(messageList);

      if (!selectedMessage && messageList.length > 0) {
        setSelectedMessage(messageList[0]);
      }
    } catch (error) {
      console.error("[AdminClaims] Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleClaimStatusUpdate = async (claimId, status) => {
    if (!claimId) {
      toast.error("No claim selected");
      return;
    }

    try {
      setUpdatingStatus(true);
      await claimsService.updateClaimStatus(claimId, status, adminNote);
      toast.success(`Claim ${status.replaceAll("_", " ")} successfully`);
      setAdminNote("");
      await fetchAllData();
    } catch (error) {
      console.error("[AdminClaims] Error updating claim status:", error);
      toast.error("Failed to update claim status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSelectClaim = async (claim) => {
    setSelectedClaim(claim);
    if (!claim) return;

    try {
      const res = await messagesService.getMessages({
        conversationId: `claim-${claim._id}`,
      });

      const messageList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setMessages(messageList);
      setSelectedMessage(messageList[0] || null);
    } catch (error) {
      console.error("[AdminClaims] Error loading conversation:", error);
      toast.error("Failed to load conversation");
    }
  };

  const handleReply = async () => {
    if (!selectedMessage) {
      toast.error("Select a message first");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please type a reply");
      return;
    }

    try {
      setSendingReply(true);
      await messagesService.replyToMessage(selectedMessage._id, replyContent.trim());
      toast.success("Reply sent");
      setReplyContent("");
      await fetchMessages();

      if (selectedClaim?._id) {
        await handleSelectClaim(selectedClaim);
      }
    } catch (error) {
      console.error("[AdminClaims] Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (filterType === "all") return true;
      return claim.status === filterType;
    });
  }, [claims, filterType]);

  const unreadCount = useMemo(() => {
    return messages.filter(
      (message) => !message.isRead && message.recipientRole === "admin"
    ).length;
  }, [messages]);

  const pendingCount = useMemo(() => {
    return claims.filter((claim) => claim.status === "pending").length;
  }, [claims]);

  if (loading) {
    return (
      <AdminContainer>
        <LoadingState type="full" />
      </AdminContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Claims & Messages | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-emerald-300 bg-gradient-to-br from-emerald-700 via-emerald-700 to-green-800">
            <div className="flex flex-col gap-6 px-6 py-7 text-white lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                  Claims Workspace
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Claims & Messages
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
                  Review ownership claims, communicate with students, and make
                  clean approval decisions from one organized workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <HeaderStat label="Claims" value={claims.length} />
                <HeaderStat label="Pending" value={pendingCount} />
                <HeaderStat label="Unread" value={unreadCount} />
                <HeaderStat label="Visible" value={filteredClaims.length} />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-[24px] border border-slate-200 bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <FaClipboardCheck />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Claims</h2>
                    <p className="text-sm text-slate-500">
                      Select a claim to review details
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {claimStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilterType(status)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                        filterType === status
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {status === "all" ? "All" : formatLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[680px] overflow-y-auto">
                {filteredClaims.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      title="No claims found"
                      description="No claims match this filter."
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredClaims.map((claim) => (
                      <button
                        key={claim._id}
                        type="button"
                        onClick={() => handleSelectClaim(claim)}
                        className={`w-full px-4 py-4 text-left ${
                          selectedClaim?._id === claim._id
                            ? "bg-emerald-50"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {claim.itemTitle || "Untitled item"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {claim.studentName || "Unknown"} • {claim.studentEmail || "No email"}
                            </p>
                          </div>

                          <span className={getClaimBadgeClass(claim.status)}>
                            {formatLabel(claim.status)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <main className="rounded-[24px] border border-slate-200 bg-white overflow-hidden">
              {selectedClaim ? (
                <>
                  <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                          {selectedClaim.itemTitle || "Claim Details"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Review the claimant details, proof, messages, and take action.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleClaimStatusUpdate(selectedClaim._id, "approved")}
                          disabled={updatingStatus}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          <FaCheck />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleClaimStatusUpdate(selectedClaim._id, "needs_more_proof")
                          }
                          disabled={updatingStatus}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 disabled:opacity-60"
                        >
                          <FaExclamationTriangle />
                          Needs Proof
                        </button>

                        <button
                          type="button"
                          onClick={() => handleClaimStatusUpdate(selectedClaim._id, "rejected")}
                          disabled={updatingStatus}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-60"
                        >
                          <FaBan />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <DetailCard title="Claimant Information" icon={<FaUserCheck />}>
                        <div className="space-y-1 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">
                            {selectedClaim.studentName || "No name"}
                          </p>
                          <p>{selectedClaim.studentEmail || "No email"}</p>
                          <p>{selectedClaim.studentPhone || "No phone"}</p>
                          <p>Student ID: {selectedClaim.studentId || "Not provided"}</p>
                        </div>
                      </DetailCard>

                      <DetailCard title="Claim Information" icon={<FaClipboardCheck />}>
                        <div className="space-y-1 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">
                            {selectedClaim.itemTitle || "Untitled item"}
                          </p>
                          <p>
                            Claimed:{" "}
                            {selectedClaim.createdAt
                              ? new Date(selectedClaim.createdAt).toLocaleString()
                              : "No date"}
                          </p>
                          <p>Status: {formatLabel(selectedClaim.status)}</p>
                        </div>
                      </DetailCard>

                      <DetailCard title="Proof of Ownership" icon={<FaCheck />}>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {selectedClaim.proofOfOwnership || "No proof provided."}
                        </p>
                      </DetailCard>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                      <section className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
                          <FaComments className="text-emerald-700" />
                          <h3 className="text-sm font-semibold text-slate-900">
                            Conversation
                          </h3>
                        </div>

                        <div className="max-h-[360px] space-y-3 overflow-y-auto p-4">
                          {messages.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                              No messages yet for this claim.
                            </div>
                          ) : (
                            messages.map((msg) => (
                              <button
                                key={msg._id}
                                type="button"
                                onClick={() => setSelectedMessage(msg)}
                                className={`block w-full rounded-2xl p-3 text-left ${
                                  msg.senderRole === "admin"
                                    ? "bg-emerald-50"
                                    : "bg-white"
                                } ${
                                  selectedMessage?._id === msg._id
                                    ? "ring-2 ring-emerald-200"
                                    : "border border-slate-200"
                                }`}
                              >
                                <p className="text-xs text-slate-500">
                                  {msg.senderEmail} •{" "}
                                  {msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleString()
                                    : ""}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-800">
                                  {msg.content}
                                </p>
                              </button>
                            ))
                          )}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                          <div className="border-b border-slate-200 px-4 py-3">
                            <h3 className="text-sm font-semibold text-slate-900">
                              Admin Decision Note
                            </h3>
                          </div>

                          <div className="p-4">
                            <textarea
                              rows={4}
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              className="w-full rounded-2xl border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                              placeholder="Add an internal note or message for the student"
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                          <div className="border-b border-slate-200 px-4 py-3">
                            <h3 className="text-sm font-semibold text-slate-900">
                              Reply to Claimant
                            </h3>
                          </div>

                          <div className="space-y-3 p-4">
                            <textarea
                              rows={5}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="w-full rounded-2xl border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                              placeholder="Write a clear reply to the claimant"
                            />

                            <button
                              type="button"
                              onClick={handleReply}
                              disabled={sendingReply}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                            >
                              <FaReply />
                              {sendingReply ? "Sending..." : "Send Reply"}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <FaInbox className="text-slate-600" />
                            <p className="text-sm font-semibold text-slate-900">
                              Latest Claim Message
                            </p>
                          </div>
                          <p className="text-sm leading-6 text-slate-600">
                            {selectedClaim.claimMessage ||
                              "No additional message provided."}
                          </p>
                        </div>
                      </section>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8">
                  <EmptyState
                    title="No claim selected"
                    description="Choose a claim from the left panel to review it."
                  />
                </div>
              )}
            </main>
          </section>
        </div>
      </AdminContainer>
    </>
  );
};

function HeaderStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-50/85">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function DetailCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <span className="text-emerald-700">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function formatLabel(value = "") {
  return value.replaceAll("_", " ");
}

function getClaimBadgeClass(status) {
  const base = "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold";

  if (status === "approved") return `${base} bg-emerald-100 text-emerald-700`;
  if (status === "rejected") return `${base} bg-red-100 text-red-700`;
  if (status === "needs_more_proof") return `${base} bg-amber-100 text-amber-700`;
  return `${base} bg-sky-100 text-sky-700`;
}

export default AdminClaims;