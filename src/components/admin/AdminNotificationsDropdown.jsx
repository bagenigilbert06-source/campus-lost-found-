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
  const dropdownRef = useRef(null);
  const { messageCount, refetch: refetchCount } = useAdminMessageCount();

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await messagesService.getMessages();
      // Filter to show ONLY messages received from students
      const allMessages = data.data || [];
      const filteredMessages = allMessages.filter((msg) => {
        // Only show messages where:
        // 1. Current admin user is the recipient
        // 2. Sender is a student
        return (
          msg.recipientEmail === user.email &&
          msg.senderRole === "student"
        );
      });
      setMessages(filteredMessages);
      refetchCount();
    } catch (error) {
      console.error("[AdminNotificationsDropdown] Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user, refetchCount]);

  useEffect(() => {
    if (!user) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [user, fetchMessages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteMessage = async (messageId) => {
    try {
      await messagesService.deleteMessage(messageId);
      await fetchMessages();
      toast.success("Message deleted");
    } catch (error) {
      console.error("[AdminNotificationsDropdown] Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

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
        {messageCount > 0 && (
          <span className="absolute top-1 right-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {messageCount > 9 ? "9+" : messageCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Student Messages</h3>
              <p className="mt-1 text-xs text-slate-500">
                {messageCount} {messageCount === 1 ? "message" : "messages"}
              </p>
            </div>

            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
              Inbox
            </span>
          </div>

          {/* Messages List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FaBell size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages from students yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {messages.map((message) => {
                  return (
                    <div
                      key={message._id}
                      className="flex items-start justify-between gap-3 px-4 py-4 hover:bg-slate-50 transition-colors"
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
                        onClick={() => deleteMessage(message._id)}
                        className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Delete message"
                        aria-label="Delete message"
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
          {messages.length > 0 && (
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
