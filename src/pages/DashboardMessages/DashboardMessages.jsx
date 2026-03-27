import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaEnvelope, FaTrash, FaReply, FaTimes, FaCheckCircle } from 'react-icons/fa';

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

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return !msg.isRead;
    if (filter === 'read') return msg.isRead;
    return true;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{`Messages - ${schoolConfig.name}`}</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">
          You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-3 font-medium transition text-center ${
                  filter === 'all'
                    ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-4 py-3 font-medium transition text-center ${
                  filter === 'unread'
                    ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`flex-1 px-4 py-3 font-medium transition text-center ${
                  filter === 'read'
                    ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Read
              </button>
            </div>

            {/* Messages */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-dots loading-lg"></span>
              </div>
            ) : filteredMessages.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMessages.map(message => (
                  <button
                    key={message._id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) handleMarkAsRead(message._id);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-start gap-3 ${
                      selectedMessage?._id === message._id ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                    } ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="pt-1">
                      {!message.isRead && (
                        <div className="w-3 h-3 bg-teal-500 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-gray-900 dark:text-white ${!message.isRead ? 'font-bold' : ''}`}>
                        {message.senderName || message.senderEmail}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {message.subject || message.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaEnvelope className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600 dark:text-gray-400">
                  {filter === 'unread' ? 'No unread messages' : 'No messages'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selectedMessage.senderName || selectedMessage.senderEmail}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMessage.senderEmail}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

              {/* Date */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>

              {/* Content */}
              <div className="mb-6 max-h-64 overflow-y-auto">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>

              {/* Status */}
              {selectedMessage.isRead && (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-4">
                  <FaCheckCircle /> Read
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                  rows={3}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleReply}
                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <FaReply /> Reply
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-medium transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <FaEnvelope className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-600 dark:text-gray-400">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMessages;
