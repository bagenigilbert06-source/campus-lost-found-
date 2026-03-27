import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaEnvelope, FaTrash, FaReply, FaTimes, FaCheckCircle, FaUser } from 'react-icons/fa';

const DashboardMessages = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/messages', {
        params: { recipientEmail: user?.email },
        withCredentials: true
      }).catch(() => ({ data: [] }));

      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMessages(data);
    } catch (error) {
      console.error('[v0] Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.patch(`http://localhost:3001/api/messages/${messageId}`, {
        isRead: true
      }, {
        withCredentials: true
      }).catch(() => null);

      setMessages(messages.map(m =>
        m._id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (error) {
      console.error('[v0] Error marking message as read:', error);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/messages/${messageId}`, {
        withCredentials: true
      }).catch(() => null);

      setMessages(messages.filter(m => m._id !== messageId));
      setSelectedMessage(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('[v0] Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/messages/reply', {
        originalMessageId: selectedMessage._id,
        senderEmail: user?.email,
        senderName: user?.displayName,
        content: replyText
      }, {
        withCredentials: true
      }).catch(() => null);

      toast.success('Reply sent!');
      setReplyText('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('[v0] Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const getFilteredMessages = () => {
    if (filter === 'all') return messages;
    if (filter === 'unread') return messages.filter(m => !m.isRead);
    if (filter === 'read') return messages.filter(m => m.isRead);
    return messages;
  };

  const filteredMessages = getFilteredMessages();
  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <>
      <Helmet>
        <title>Messages - {schoolConfig.name} Lost & Found</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'all', label: 'All Messages', count: messages.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'read', label: 'Read', count: messages.filter(m => m.isRead).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                filter === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FaEnvelope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No messages yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredMessages.map(message => (
                  <button
                    key={message._id}
                    onClick={() => {
                      handleMarkAsRead(message._id);
                      setSelectedMessage(message);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      selectedMessage?._id === message._id ? 'bg-teal-50' : ''
                    } ${!message.isRead ? 'bg-teal-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-teal-100">
                        <FaUser className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-gray-900 truncate ${!message.isRead ? 'font-bold' : ''}`}>
                          {message.senderName || message.senderEmail}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!message.isRead && (
                        <div className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  {/* Message Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-teal-100">
                        <FaEnvelope className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedMessage.senderName || selectedMessage.senderEmail}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(selectedMessage.createdAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMessage(null);
                        setReplyText('');
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <FaTimes className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Message Content */}
                  <div className="mb-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-medium"
                    >
                      <FaTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {/* Reply Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Send a Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                    <button
                      onClick={handleReply}
                      className="mt-3 flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition font-medium"
                    >
                      <FaReply className="w-4 h-4" />
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <FaEnvelope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a message to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardMessages;
