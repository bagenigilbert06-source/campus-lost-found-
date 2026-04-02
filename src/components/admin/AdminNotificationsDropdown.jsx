import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import AuthContext from "../../context/Authcontext/AuthContext";
import { messagesService } from "../../services/apiService";
import useAdminMessageCount from "../../hooks/useAdminMessageCount";

const AdminNotificationsDropdown = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('adminNotificationsDismissed');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const { messageCount, refetch: refetchCount } = useAdminMessageCount();
  const visibleCount = Math.max(0, messageCount - dismissedIds.length);
  const dropdownRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Use backend filtering instead of fetching all messages and filtering client-side
      const data = await messagesService.getMessages({
        senderRole: 'student',
        limit: 50, // Limit to recent messages
      });
      
      const messages = data.data || [];
      setMessages(messages);
      // Don't call refetchCount here - it would make a duplicate request
      // The count hook will update independently when it fetches
    } catch (error) {
      console.error("[AdminNotificationsDropdown] Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
    }
  }, [isOpen, user, fetchMessages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('adminNotificationsDismissed', JSON.stringify(dismissedIds));
    } catch (error) {
      console.warn('[AdminNotificationsDropdown] localStorage save failed', error);
    }
  }, [dismissedIds]);

  const dismissNotification = (messageId) => {
    setDismissedIds((prev) => Array.from(new Set([...prev, messageId])));
    toast.success('Notification dismissed');
  };

  const openThread = async (conversationId, messageId) => {
    if (!conversationId) return;
    try {
      if (messageId) {
        await messagesService.markAsRead(messageId).catch(() => null);
      }
    } catch (_) {
      // ignore
    }

    setIsOpen(false);
    navigate(`/admin/messages?thread=${encodeURIComponent(conversationId)}`);
  };


  const visibleMessages = messages.filter((message) => !dismissedIds.includes(message._id));

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
        aria-label="Open notifications"
      >
        <FaBell size={18} className="text-white" />
        {visibleCount > 0 && (
          <span className="absolute top-1 right-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {visibleCount > 9 ? "9+" : visibleCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-[min(92vw,22rem)] max-w-[95vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:left-auto sm:right-0 sm:translate-x-0 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Student Messages</h3>
              <p className="mt-1 text-xs text-slate-500">
                {visibleCount} {visibleCount === 1 ? "message" : "messages"} shown
              </p>
            </div>

            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
              Inbox
            </span>
          </div>

          {/* Messages List */}
          <div className="max-h-[60vh] overflow-y-auto sm:max-h-96">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FaBell size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages from students yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleMessages.map((message) => {
                  const conversationId = message.conversationId || message._id;
                  return (
                    <div
                      key={message._id}
                      className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => openThread(conversationId, message._id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="truncate text-sm font-semibold text-slate-900">
                            {message.senderEmail || "Student"}
                          </h4>

                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 whitespace-nowrap">
                            Student
                          </span>
                        </div>

                        <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                          {message.content}
                        </p>

                        <span className="mt-2 block text-[11px] text-slate-400">
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(message._id);
                        }}
                        className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <FaTimes size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {visibleMessages.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => {
                  navigate("/admin/messages");
                  setIsOpen(false);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                View All Messages
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsDropdown;
