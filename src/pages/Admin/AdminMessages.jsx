import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FaEnvelope, FaTrash, FaArrowLeft, FaSearch, FaReply, FaEye, FaUser, FaUserShield } from 'react-icons/fa';
import AuthContext from '../../context/Authcontext/AuthContext';
import { messagesService } from '../../services/apiService';
import PaginationComponent from '../../components/PaginationComponent';
import MessageBubble from '../../components/MessageBubble';

const ITEMS_PER_PAGE = 10;

const AdminMessages = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin-login');
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Get all messages for conversation building
      const response = await messagesService.getMessages({ limit: 200 });
      const allMessages = response.data || [];

      setMessages(allMessages);

      // Group messages into conversations
      const conversationMap = new Map();

      allMessages.forEach(message => {
        const key = message.conversationId;
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            conversationId: key,
            itemId: message.itemId,
            lastMessage: message,
            studentEmail: message.senderRole === 'student' ? message.senderEmail : message.recipientEmail,
            adminEmail: message.senderRole === 'admin' ? message.senderEmail : message.recipientEmail,
            participants: new Set([message.senderEmail, message.recipientEmail]),
            unreadCount: 0,
            messages: [],
            messageCount: 0
          });
        }

        const conv = conversationMap.get(key);
        conv.messages.push(message);
        conv.messageCount++;

        // Count unread messages from students
        if (message.senderRole === 'student' && !message.isRead) {
          conv.unreadCount++;
        }
      });

      // Sort conversations by last message date
      const sortedConversations = Array.from(conversationMap.values())
        .map(conv => ({
          ...conv,
          participants: Array.from(conv.participants),
          lastMessageTime: new Date(conv.lastMessage.createdAt)
        }))
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setConversations(sortedConversations);
    } catch (error) {
      console.error('[AdminMessages] Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await messagesService.deleteMessage(messageId);
        toast.success('Message deleted successfully');
        await fetchMessages();
      } catch (error) {
        console.error('[AdminMessages] Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const lastMessage = selectedConversation.lastMessage;

      await messagesService.replyToMessage(lastMessage._id, replyContent.trim());

      // Refresh messages
      await fetchMessages();

      // Clear reply input
      setReplyContent('');

      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply();
    }
  };

  const markAsRead = async (conversation) => {
    try {
      const unreadMessages = conversation.messages.filter(
        msg => msg.senderRole === 'student' && !msg.isRead
      );

      for (const message of unreadMessages) {
        await messagesService.markAsRead(message._id, true);
      }

      // Update local state
      setConversations(prev => prev.map(conv =>
        conv.conversationId === conversation.conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));

      setSelectedConversation(prev => prev ? { ...prev, unreadCount: 0 } : null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Update filtered conversations based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => {
        const searchLower = searchTerm.toLowerCase();
        return conv.studentEmail.toLowerCase().includes(searchLower) ||
               conv.lastMessage.content.toLowerCase().includes(searchLower) ||
               conv.itemId.toLowerCase().includes(searchLower);
      });
      setFilteredConversations(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [conversations, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredConversations.length / ITEMS_PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Student Messages - Admin Panel</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <FaArrowLeft size={16} />
                Back
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Messages</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage all messages received from students
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Total Conversations</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{conversations.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Active Today</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">
                {conversations.filter(c => {
                  const today = new Date().toDateString();
                  const msgDate = new Date(c.lastMessage.createdAt).toDateString();
                  return today === msgDate;
                }).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Unread Messages</div>
              <div className="text-3xl font-bold text-blue-600 mt-1">
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Total Messages</div>
              <div className="text-3xl font-bold text-purple-600 mt-1">
                {messages.length}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by student email, message content, or item ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Messages List */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <FaEnvelope size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 text-lg">
                  {searchTerm ? 'No messages match your search' : 'No messages from students yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Last Message</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Item</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedConversations.map((conversation) => (
                      <tr
                        key={conversation.conversationId}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedConversation?.conversationId === conversation.conversationId ? 'bg-emerald-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          markAsRead(conversation);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-700">
                                {conversation.studentEmail?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{conversation.studentEmail}</p>
                              <p className="text-xs text-slate-500">{conversation.messageCount} messages</p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-medium">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 line-clamp-2">{conversation.lastMessage.content}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          #{conversation.itemId}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(conversation.lastMessage.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedConversation(conversation);
                                markAsRead(conversation);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View conversation"
                            >
                              <FaEye size={14} />
                              <span className="text-sm">View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredConversations.length > 0 && (
            <>
              <div className="mt-6 text-center text-sm text-slate-600">
                Showing {paginatedConversations.length} of {filteredConversations.length} conversations
              </div>

              {totalPages > 1 && (
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredConversations.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>

        {/* Conversation Detail Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-purple-700">
                        {selectedConversation.studentEmail?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Conversation with {selectedConversation.studentEmail}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Item #{selectedConversation.itemId} • {selectedConversation.messages.length} messages
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <FaTimes className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 max-h-96">
                {selectedConversation.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((message) => (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isCurrentUser={message.senderEmail === user?.email}
                      showRole={true}
                      className="mb-4"
                    />
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={sending}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || sending}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {sending ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <FaReply size={14} />
                    )}
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminMessages;
