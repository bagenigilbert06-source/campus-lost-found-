import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import {
  FaEnvelope,
  FaReply,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import AdminContainer from '../../components/admin/AdminContainer';
import EmptyState from '../../components/admin/EmptyState';
import LoadingState from '../../components/admin/LoadingState';

const AdminClaims = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/messages?role=admin', {
        withCredentials: true
      });
      setMessages(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.patch(`http://localhost:3001/api/messages/${messageId}`, {
        isRead: true,
        readAt: new Date().toISOString()
      }, { withCredentials: true });
      
      fetchMessages();
    } catch (error) {
      console.error('[v0] Error marking message as read:', error);
    }
  };

  const handleReplyMessage = async () => {
    if (!replyContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/messages', {
        conversationId: selectedMessage.conversationId,
        content: replyContent,
        senderRole: 'admin'
      }, { withCredentials: true });

      toast.success('Reply sent successfully');
      setReplyContent('');
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const getFilteredMessages = () => {
    if (filterType === 'unread') {
      return messages.filter(m => !m.isRead && m.recipientRole === 'admin');
    }
    return messages;
  };

  const filteredMessages = getFilteredMessages();
  const unreadCount = messages.filter(m => !m.isRead && m.recipientRole === 'admin').length;

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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claims & Messages</h1>
          <p className="text-gray-500 mt-1">Manage item claims and communicate with users</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`btn btn-sm btn-outline ${filterType === 'all' ? 'bg-zetech-primary border-zetech-primary text-white' : ''}`}
                  >
                    All ({filteredMessages.length})
                  </button>
                  <button
                    onClick={() => setFilterType('unread')}
                    className={`btn btn-sm btn-outline ${filterType === 'unread' ? 'bg-zetech-primary border-zetech-primary text-white' : ''}`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto divide-y">
                {filteredMessages.length === 0 ? (
                  <EmptyState
                    title="No messages"
                    description={filterType === 'unread' ? 'All messages read' : 'No messages yet'}
                  />
                ) : (
                  filteredMessages.map(msg => (
                    <button
                      key={msg._id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.isRead && msg.recipientRole === 'admin') {
                          handleMarkAsRead(msg._id);
                        }
                      }}
                      className={`w-full text-left p-4 border-l-4 hover:bg-gray-50 transition ${
                        selectedMessage?._id === msg._id
                          ? 'bg-zetech-primary/5 border-l-zetech-primary'
                          : 'border-l-transparent'
                      } ${!msg.isRead && msg.recipientRole === 'admin' ? 'bg-yellow-50 font-semibold' : ''}`}
                    >
                      <p className="text-sm truncate text-gray-900">{msg.senderEmail}</p>
                      <p className="text-xs text-gray-600 truncate mt-1">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                      {!msg.isRead && msg.recipientRole === 'admin' && (
                        <span className="badge badge-xs badge-warning mt-2">New</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="p-6 border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedMessage.senderEmail}</h3>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {selectedMessage.itemId && (
                        <span className="badge badge-primary">Item Inquiry</span>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border-l-4 border-zetech-primary">
                        <p className="text-gray-800 whitespace-pre-wrap break-words">{selectedMessage.content}</p>
                      </div>

                      {selectedMessage.relatedMessages && selectedMessage.relatedMessages.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-gray-600">Previous Messages</p>
                          {selectedMessage.relatedMessages.map((msg, idx) => (
                            <div key={idx} className={`rounded-lg p-4 ${msg.senderRole === 'admin' ? 'bg-zetech-primary/10 text-right ml-8' : 'bg-white text-left mr-8'}`}>
                              <p className={`text-sm ${msg.senderRole === 'admin' ? 'text-zetech-primary' : 'text-gray-600'}`}>
                                {msg.senderRole === 'admin' ? 'You' : msg.senderEmail}
                              </p>
                              <p className="text-gray-800 mt-2 whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply Form */}
                  <div className="p-6 border-t bg-white">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Send Reply</label>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zetech-primary mb-3 resize-none"
                      rows="3"
                    />
                    <button
                      onClick={handleReplyMessage}
                      className="w-full btn btn-primary text-white bg-zetech-primary hover:bg-zetech-dark border-0"
                    >
                      <FaReply size={14} /> Send Reply
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    icon={FaEnvelope}
                    title="No message selected"
                    description="Select a message from the list to view details and reply"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminContainer>
    </>
  );
};

export default AdminClaims;
