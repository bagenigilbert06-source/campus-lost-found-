import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FaEnvelope, FaTrash, FaArrowLeft } from 'react-icons/fa';
import AuthContext from '../../context/Authcontext/AuthContext';
import { messagesService } from '../../services/apiService';
import PaginationComponent from '../../components/PaginationComponent';

const ITEMS_PER_PAGE = 10;

const AdminMessages = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
      // Use backend filtering instead of client-side filtering
      const response = await messagesService.getMessages({
        senderRole: 'student',
        limit: 100, // Limit to fetch only necessary data
      });
      const studentMessages = response.data || [];

      // Already sorted by backend in descending order
      setMessages(studentMessages);
      setFilteredMessages(studentMessages);
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

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter((msg) => {
        const searchLower = term.toLowerCase();
        return (
          msg.senderEmail.toLowerCase().includes(searchLower) ||
          msg.content.toLowerCase().includes(searchLower)
        );
      });
      setFilteredMessages(filtered);
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              <div className="text-sm text-slate-600">Total Messages</div>
              <div className="text-3xl font-bold text-slate-900 mt-1">{messages.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Today</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">
                {messages.filter(m => {
                  const today = new Date().toDateString();
                  const msgDate = new Date(m.createdAt).toDateString();
                  return today === msgDate;
                }).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Unique Students</div>
              <div className="text-3xl font-bold text-blue-600 mt-1">
                {new Set(messages.map(m => m.senderEmail)).size}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-600">Average per Day</div>
              <div className="text-3xl font-bold text-purple-600 mt-1">
                {messages.length > 0 ? (messages.length / 7).toFixed(1) : 0}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by student email or message content..."
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">From</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Message</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMessages.map((message) => (
                      <tr key={message._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-700">
                                {message.senderEmail?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{message.senderEmail}</p>
                              <p className="text-xs text-slate-500">Student</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600 line-clamp-2">{message.content}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(message.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => deleteMessage(message._id)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete message"
                            >
                              <FaTrash size={14} />
                              <span className="text-sm">Delete</span>
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

          {/* Pagination info */}
          {!loading && filteredMessages.length > 0 && (
            <>
              <div className="mt-6 text-center text-sm text-slate-600">
                Showing {paginatedMessages.length} of {filteredMessages.length} messages
              </div>

              {totalPages > 1 && (
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredMessages.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminMessages;
