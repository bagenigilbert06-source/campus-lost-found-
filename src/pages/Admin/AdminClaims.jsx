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
  FaUser,
  FaClock,
  FaPaperPlane,
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
  const [conversationMessages, setConversationMessages] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchAllData(true);
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
      const res = await messagesService.getMessages({ limit: 100 });
      const messageList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      setMessages(messageList);
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

      setConversationMessages(messageList);
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

  const currentConversationMessages = useMemo(() => {
    return conversationMessages
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [conversationMessages]);

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

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <ClaimsSidebar
              claims={filteredClaims}
              selectedClaim={selectedClaim}
              filterType={filterType}
              onFilterChange={setFilterType}
              onClaimSelect={handleSelectClaim}
            />

            <ClaimReviewPanel
              selectedClaim={selectedClaim}
              currentConversationMessages={currentConversationMessages}
              adminNote={adminNote}
              replyContent={replyContent}
              sendingReply={sendingReply}
              updatingStatus={updatingStatus}
              onAdminNoteChange={setAdminNote}
              onReplyContentChange={setReplyContent}
              onReply={handleReply}
              onStatusUpdate={handleClaimStatusUpdate}
            />
          </section>
        </div>
      </AdminContainer>
    </>
  );
};

function ClaimsSidebar({ claims, selectedClaim, filterType, onFilterChange, onClaimSelect }) {
  return (
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
              onClick={() => onFilterChange(status)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                filterType === status
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {status === "all" ? "All" : formatLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[680px] overflow-y-auto">
        {claims.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No claims found"
              description="No claims match this filter."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <button
                key={claim._id}
                type="button"
                onClick={() => onClaimSelect(claim)}
                className={`w-full px-5 py-4 text-left transition-colors hover:bg-slate-50 ${
                  selectedClaim?._id === claim._id
                    ? "bg-emerald-50 border-r-2 border-emerald-500"
                    : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 mb-1">
                      {claim.itemTitle || "Untitled item"}
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-600 truncate">
                        {claim.studentName || "Unknown student"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {claim.studentEmail || "No email"}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {claim.createdAt
                        ? new Date(claim.createdAt).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={getClaimBadgeClass(claim.status)}>
                      {formatLabel(claim.status)}
                    </span>
                    {claim.status === "pending" && (
                      <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function ClaimReviewPanel({
  selectedClaim,
  currentConversationMessages,
  adminNote,
  replyContent,
  sendingReply,
  updatingStatus,
  onAdminNoteChange,
  onReplyContentChange,
  onReply,
  onStatusUpdate,
}) {
  if (!selectedClaim) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-8">
        <EmptyState
          title="No claim selected"
          description="Choose a claim from the left panel to review it."
        />
      </div>
    );
  }

  return (
    <main className="rounded-[24px] border border-slate-200 bg-white overflow-hidden">
      {/* Header with actions */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedClaim.itemTitle || "Claim Details"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review claimant details, proof, and conversation history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStatusUpdate(selectedClaim._id, "approved")}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              <FaCheck />
              Approve
            </button>

            <button
              type="button"
              onClick={() => onStatusUpdate(selectedClaim._id, "needs_more_proof")}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60 transition-colors"
            >
              <FaExclamationTriangle />
              Needs Proof
            </button>

            <button
              type="button"
              onClick={() => onStatusUpdate(selectedClaim._id, "rejected")}
              disabled={updatingStatus}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 transition-colors"
            >
              <FaBan />
              Reject
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Info cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DetailCard title="Claimant Information" icon={<FaUserCheck />}>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedClaim.studentName || "No name provided"}
                </p>
              </div>
              <div className="space-y-1 text-slate-600">
                <p className="flex items-center gap-2">
                  <FaEnvelope className="text-xs" />
                  {selectedClaim.studentEmail || "No email"}
                </p>
                <p>{selectedClaim.studentPhone || "No phone"}</p>
                <p>Student ID: {selectedClaim.studentId || "Not provided"}</p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Claim Information" icon={<FaClipboardCheck />}>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedClaim.itemTitle || "Untitled item"}
                </p>
              </div>
              <div className="space-y-1 text-slate-600">
                <p className="flex items-center gap-2">
                  <FaClock className="text-xs" />
                  {selectedClaim.createdAt
                    ? new Date(selectedClaim.createdAt).toLocaleString()
                    : "No date"}
                </p>
                <p>Status: <span className={getClaimBadgeClass(selectedClaim.status)}>{formatLabel(selectedClaim.status)}</span></p>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Proof of Ownership" icon={<FaCheck />}>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {selectedClaim.proofOfOwnership || "No proof provided."}
            </p>
          </DetailCard>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          {/* Conversation thread */}
          <AdminConversationThread messages={currentConversationMessages} />

          {/* Side panel */}
          <div className="space-y-4">
            <AdminInternalNotePanel
              adminNote={adminNote}
              onAdminNoteChange={onAdminNoteChange}
            />

            <ClaimReplyComposer
              replyContent={replyContent}
              sendingReply={sendingReply}
              onReplyContentChange={onReplyContentChange}
              onReply={onReply}
            />

            {selectedClaim.claimMessage && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FaInbox className="text-slate-600" />
                  <p className="text-sm font-semibold text-slate-900">
                    Claim Message
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  {selectedClaim.claimMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminConversationThread({ messages }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <FaComments className="text-emerald-700" />
        <h3 className="text-sm font-semibold text-slate-900">
          Conversation Thread
        </h3>
        <span className="ml-auto text-xs text-slate-500">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <FaComments className="mx-auto text-slate-400 mb-2" size={24} />
            <p className="text-sm text-slate-500">No messages yet for this claim.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ConversationMessageBubble
              key={msg._id}
              message={msg}
              isLast={index === messages.length - 1}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ConversationMessageBubble({ message, isLast }) {
  const isAdmin = message.senderRole === "admin";
  const isStudent = message.senderRole === "student";

  return (
    <div className={`flex gap-3 ${isAdmin ? "justify-end" : "justify-start"}`}>
      {isStudent && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
          <FaUser />
        </div>
      )}

      <div className={`max-w-[70%] ${isAdmin ? "order-first" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isAdmin
            ? "bg-emerald-600 text-white"
            : "bg-slate-100 text-slate-900"
        }`}>
          <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className={`flex items-center gap-2 mt-1 text-xs ${
          isAdmin ? "justify-end" : "justify-start"
        }`}>
          <span className="text-slate-500">
            {message.senderEmail}
          </span>
          <span className="text-slate-400">
            {message.createdAt
              ? new Date(message.createdAt).toLocaleString()
              : ""}
          </span>
        </div>
      </div>

      {isAdmin && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
          A
        </div>
      )}
    </div>
  );
}

function AdminInternalNotePanel({ adminNote, onAdminNoteChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Internal Admin Note
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Private notes for this claim (not visible to claimant)
        </p>
      </div>

      <div className="p-4">
        <textarea
          rows={4}
          value={adminNote}
          onChange={(e) => onAdminNoteChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
          placeholder="Add internal notes about this claim..."
        />
      </div>
    </div>
  );
}

function ClaimReplyComposer({ replyContent, sendingReply, onReplyContentChange, onReply }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Reply to Claimant
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Send a message that will appear in the conversation
        </p>
      </div>

      <div className="p-4 space-y-3">
        <textarea
          rows={4}
          value={replyContent}
          onChange={(e) => onReplyContentChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
          placeholder="Write your reply to the claimant..."
        />

        <button
          type="button"
          onClick={onReply}
          disabled={sendingReply || !replyContent.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full justify-center"
        >
          <FaPaperPlane />
          {sendingReply ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
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