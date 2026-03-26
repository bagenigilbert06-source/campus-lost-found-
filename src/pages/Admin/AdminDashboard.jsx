import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import { FaCheckCircle, FaTimesCircle, FaEye, FaClipboardList, FaShieldAlt, FaUsers, FaBoxes, FaTrash, FaSearch, FaEnvelope, FaReply, FaSignOutAlt } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user, signOutUser } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalItems: 0,
        pendingVerification: 0,
        verifiedItems: 0,
        recoveredItems: 0,
        totalUsers: 0,
        unreadMessages: 0
    });
    const [pendingItems, setPendingItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch all items
            const itemsRes = await axios.get('http://localhost:3001/api/items');
            const items = itemsRes.data;
            
            // Fetch recovered items
            const recoveredRes = await axios.get('http://localhost:3001/api/items?status=recovered', {
                withCredentials: true
            });
            
            // Fetch messages for admin
            const messagesRes = await axios.get('http://localhost:3001/api/messages?role=admin', {
                withCredentials: true
            }).catch(() => ({ data: [] }));
            
            // Calculate stats
            const pendingItems = items.filter(item => item.verificationStatus === 'pending' || !item.verificationStatus);
            const verifiedItems = items.filter(item => item.verificationStatus === 'verified');
            const unreadMessages = messagesRes.data?.filter(m => !m.isRead && m.recipientRole === 'admin').length || 0;
            
            setStats({
                totalItems: items.length,
                pendingVerification: pendingItems.length,
                verifiedItems: verifiedItems.length,
                recoveredItems: recoveredRes.data?.length || 0,
                totalUsers: new Set(items.map(item => item.email)).size,
                unreadMessages: unreadMessages
            });
            
            setPendingItems(pendingItems);
            setAllItems(items);
            setMessages(messagesRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error('[v0] Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleVerifyItem = async (itemId) => {
        try {
            await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
                verificationStatus: 'verified',
                verifiedBy: user.email,
                verifiedAt: new Date().toISOString()
            }, { withCredentials: true });
            
            toast.success('Item verified successfully!');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to verify item');
            console.error(error);
        }
    };

    const handleRejectItem = async (itemId) => {
        try {
            await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
                verificationStatus: 'rejected',
                verifiedBy: user.email,
                verifiedAt: new Date().toISOString()
            }, { withCredentials: true });
            
            toast.success('Item rejected');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to reject item');
            console.error(error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await axios.delete(`http://localhost:3001/api/items/${itemId}`, {
                withCredentials: true
            });
            
            toast.success('Item deleted successfully');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to delete item');
            console.error(error);
        }
    };

    const handleUpdateStatus = async (itemId, newStatus) => {
        try {
            await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            }, { withCredentials: true });
            
            toast.success(`Item marked as ${newStatus}`);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to update item status');
            console.error(error);
        }
    };

    const handleReplyMessage = async (messageId, conversationId) => {
        if (!replyContent.trim()) {
            toast.error('Please enter a message');
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/messages', {
                conversationId,
                content: replyContent,
                senderRole: 'admin'
            }, { withCredentials: true });

            toast.success('Reply sent successfully');
            setReplyContent('');
            setSelectedMessage(null);
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to send reply');
            console.error(error);
        }
    };

    const handleMarkMessageAsRead = async (messageId) => {
        try {
            await axios.patch(`http://localhost:3001/api/messages/${messageId}`, {
                isRead: true,
                readAt: new Date().toISOString()
            }, { withCredentials: true });
            
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOutUser();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const filteredItems = allItems.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-dots loading-lg text-zetech-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zetech-light to-white">
            <Helmet>
                <title>Admin Dashboard | {schoolConfig.name} Lost & Found</title>
            </Helmet>

            {/* Header */}
            <div className="bg-zetech-primary text-white py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-zetech-secondary p-3 rounded-full">
                                <FaShieldAlt className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold font-poppins">Security Office Dashboard</h1>
                                <p className="text-zetech-light opacity-80">Welcome, {user?.displayName || 'Security Officer'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-zetech-primary"
                            title="Logout"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="tabs tabs-boxed bg-white shadow-md mb-6 flex flex-wrap">
                    <button 
                        className={`tab ${activeTab === 'overview' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab ${activeTab === 'pending' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({stats.pendingVerification})
                    </button>
                    <button 
                        className={`tab ${activeTab === 'all' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Items ({stats.totalItems})
                    </button>
                    <button 
                        className={`tab ${activeTab === 'messages' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages {stats.unreadMessages > 0 && <span className="badge badge-error ml-2">{stats.unreadMessages}</span>}
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-zetech-primary p-4">
                                <div className="stat-figure text-zetech-primary">
                                    <FaBoxes className="text-2xl" />
                                </div>
                                <div className="stat-title text-xs text-gray-500">Total Items</div>
                                <div className="stat-value text-lg text-zetech-primary">{stats.totalItems}</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-yellow-500 p-4">
                                <div className="stat-figure text-yellow-500">
                                    <FaClipboardList className="text-2xl" />
                                </div>
                                <div className="stat-title text-xs text-gray-500">Pending</div>
                                <div className="stat-value text-lg text-yellow-500">{stats.pendingVerification}</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-4">
                                <div className="stat-figure text-green-500">
                                    <FaCheckCircle className="text-2xl" />
                                </div>
                                <div className="stat-title text-xs text-gray-500">Verified</div>
                                <div className="stat-value text-lg text-green-500">{stats.verifiedItems}</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-zetech-secondary p-4">
                                <div className="stat-figure text-zetech-secondary">
                                    <FaCheckCircle className="text-2xl" />
                                </div>
                                <div className="stat-title text-xs text-gray-500">Recovered</div>
                                <div className="stat-value text-lg text-zetech-secondary">{stats.recoveredItems}</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-4">
                                <div className="stat-figure text-red-500">
                                    <FaEnvelope className="text-2xl" />
                                </div>
                                <div className="stat-title text-xs text-gray-500">Unread</div>
                                <div className="stat-value text-lg text-red-500">{stats.unreadMessages}</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-zetech-primary mb-4">Quick Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                <Link 
                                    to="/addItems" 
                                    className="btn bg-zetech-primary hover:bg-zetech-dark text-white btn-sm"
                                >
                                    + Report New Item
                                </Link>
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className="btn bg-yellow-500 hover:bg-yellow-600 text-white btn-sm"
                                >
                                    Review Pending Items
                                </button>
                                <button
                                    onClick={() => setActiveTab('messages')}
                                    className="btn btn-outline border-zetech-primary text-zetech-primary hover:bg-zetech-primary hover:text-white btn-sm"
                                >
                                    <FaEnvelope /> Check Messages
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        {pendingItems.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-zetech-primary mb-4">Pending Verification ({pendingItems.length})</h2>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {pendingItems.slice(0, 5).map(item => (
                                        <div key={item._id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-600">{item.location}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleVerifyItem(item._id)} className="btn btn-xs btn-success text-white"><FaCheckCircle /></button>
                                                <button onClick={() => handleRejectItem(item._id)} className="btn btn-xs btn-error text-white"><FaTimesCircle /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Verification Tab */}
                {activeTab === 'pending' && (
                    <PendingItemsTab 
                        items={pendingItems}
                        onVerify={handleVerifyItem}
                        onReject={handleRejectItem}
                        onDelete={handleDeleteItem}
                        onRefresh={fetchDashboardData}
                    />
                )}

                {/* All Items Tab */}
                {activeTab === 'all' && (
                    <AllItemsTab 
                        items={filteredItems}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteItem}
                        onVerify={handleVerifyItem}
                        onReject={handleRejectItem}
                    />
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <MessagesTab 
                        messages={messages}
                        selectedMessage={selectedMessage}
                        onSelectMessage={setSelectedMessage}
                        onMarkAsRead={handleMarkMessageAsRead}
                        replyContent={replyContent}
                        onReplyChange={setReplyContent}
                        onSendReply={handleReplyMessage}
                    />
                )}
            </div>
        </div>
    );
};

// Pending Items Tab Component
const PendingItemsTab = ({ items, onVerify, onReject, onDelete, onRefresh }) => {
    if (items.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zetech-primary mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No items pending verification.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zetech-primary">
                    Pending Verification ({items.length})
                </h2>
                <button 
                    onClick={onRefresh}
                    className="btn btn-sm btn-outline border-zetech-primary text-zetech-primary"
                >
                    Refresh
                </button>
            </div>
            
            <div className="grid gap-4">
                {items.map(item => (
                    <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4">
                            {item.images?.[0] && (
                                <div className="w-full md:w-32 h-32 flex-shrink-0">
                                    <img 
                                        src={item.images[0]} 
                                        alt={item.title}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            
                            <div className="flex-grow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-zetech-primary">{item.title}</h3>
                                        <span className={`badge ${item.itemType === 'Lost' ? 'badge-error' : 'badge-success'}`}>
                                            {item.itemType}
                                        </span>
                                    </div>
                                    <span className="badge badge-warning">Pending</span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                    <p><strong>Category:</strong> {item.category}</p>
                                    <p><strong>Location:</strong> {item.location}</p>
                                    <p><strong>Date:</strong> {new Date(item.dateLost).toLocaleDateString()}</p>
                                    <p><strong>By:</strong> {item.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex md:flex-col gap-2">
                                <button 
                                    onClick={() => onVerify(item._id)}
                                    className="btn btn-sm btn-success text-white"
                                    title="Verify"
                                >
                                    <FaCheckCircle /> Verify
                                </button>
                                <button 
                                    onClick={() => onReject(item._id)}
                                    className="btn btn-sm btn-error text-white"
                                    title="Reject"
                                >
                                    <FaTimesCircle /> Reject
                                </button>
                                <button 
                                    onClick={() => onDelete(item._id)}
                                    className="btn btn-sm btn-outline border-red-500 text-red-500"
                                    title="Delete"
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// All Items Tab Component
const AllItemsTab = ({ items, searchQuery, onSearchChange, onUpdateStatus, onDelete, onVerify, onReject }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-zetech-primary mb-4">Search & Manage Items ({items.length})</h2>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title, location, or category..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                    />
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-8">
                    <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No items found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-zetech-light">
                            <tr>
                                <th>Item</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Verification</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="font-medium">{item.title}</td>
                                    <td>
                                        <span className={`badge ${item.itemType === 'Lost' ? 'badge-error' : 'badge-success'}`}>
                                            {item.itemType}
                                        </span>
                                    </td>
                                    <td>{item.location}</td>
                                    <td>
                                        <select 
                                            value={item.status || 'active'}
                                            onChange={(e) => onUpdateStatus(item._id, e.target.value)}
                                            className="select select-bordered select-sm"
                                        >
                                            <option value="active">Active</option>
                                            <option value="recovered">Recovered</option>
                                            <option value="claimed">Claimed</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            item.verificationStatus === 'verified' ? 'badge-success' :
                                            item.verificationStatus === 'rejected' ? 'badge-error' :
                                            'badge-warning'
                                        }`}>
                                            {item.verificationStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td className="flex gap-1">
                                        <Link 
                                            to={`/items/${item._id}`}
                                            className="btn btn-xs btn-info text-white"
                                            title="View"
                                        >
                                            <FaEye />
                                        </Link>
                                        <button 
                                            onClick={() => onDelete(item._id)}
                                            className="btn btn-xs btn-error text-white"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// Messages Tab Component
const MessagesTab = ({ messages, selectedMessage, onSelectMessage, onMarkAsRead, replyContent, onReplyChange, onSendReply }) => {
    const unreadMessages = messages.filter(m => !m.isRead && m.recipientRole === 'admin');
    const readMessages = messages.filter(m => m.isRead && m.recipientRole === 'admin');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto">
                <h2 className="text-xl font-bold text-zetech-primary mb-4">Messages ({messages.length})</h2>
                
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No messages</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {unreadMessages.map(msg => (
                            <button
                                key={msg._id}
                                onClick={() => {
                                    onSelectMessage(msg);
                                    if (!msg.isRead) onMarkAsRead(msg._id);
                                }}
                                className={`w-full text-left p-3 rounded-lg border-l-4 ${
                                    selectedMessage?._id === msg._id 
                                        ? 'bg-zetech-light border-l-zetech-primary' 
                                        : 'border-l-yellow-500 hover:bg-gray-50'
                                } ${!msg.isRead ? 'font-bold bg-yellow-50' : ''}`}
                            >
                                <p className="text-sm font-semibold text-gray-900 truncate">{msg.senderEmail}</p>
                                <p className="text-xs text-gray-600 truncate">{msg.content}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                            </button>
                        ))}
                        
                        {readMessages.map(msg => (
                            <button
                                key={msg._id}
                                onClick={() => onSelectMessage(msg)}
                                className={`w-full text-left p-3 rounded-lg border-l-4 text-gray-600 ${
                                    selectedMessage?._id === msg._id 
                                        ? 'bg-zetech-light border-l-zetech-primary' 
                                        : 'border-l-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <p className="text-sm font-semibold text-gray-700 truncate">{msg.senderEmail}</p>
                                <p className="text-xs truncate">{msg.content}</p>
                                <p className="text-xs mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Message Details & Reply */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                {selectedMessage ? (
                    <div>
                        <div className="mb-6 pb-6 border-b">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-zetech-primary">{selectedMessage.senderEmail}</h3>
                                    <p className="text-xs text-gray-600">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                                </div>
                                {!selectedMessage.isRead && (
                                    <span className="badge badge-warning">Unread</span>
                                )}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{selectedMessage.content}</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-zetech-primary mb-3 flex items-center gap-2">
                                <FaReply /> Send Reply
                            </h4>
                            <textarea
                                value={replyContent}
                                onChange={(e) => onReplyChange(e.target.value)}
                                placeholder="Type your reply here..."
                                className="textarea textarea-bordered w-full mb-3"
                                rows="4"
                            ></textarea>
                            <button
                                onClick={() => onSendReply(selectedMessage._id, selectedMessage.conversationId)}
                                className="btn bg-zetech-primary hover:bg-zetech-dark text-white w-full"
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">Select a message to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch all items
            const itemsRes = await axios.get('http://localhost:3001/api/items');
            const items = itemsRes.data;
            
            // Fetch recovered items
            const recoveredRes = await axios.get('http://localhost:3001/api/items?status=recovered', {
                withCredentials: true
            });
            
            // Calculate stats
            const pendingItems = items.filter(item => item.verificationStatus === 'pending' || !item.verificationStatus);
            const verifiedItems = items.filter(item => item.verificationStatus === 'verified');
            
            setStats({
                totalItems: items.length,
                pendingVerification: pendingItems.length,
                verifiedItems: verifiedItems.length,
                recoveredItems: recoveredRes.data?.length || 0,
                totalUsers: new Set(items.map(item => item.email)).size
            });
            
            setPendingItems(pendingItems.slice(0, 10)); // Show first 10 pending items
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const handleVerifyItem = async (itemId) => {
        try {
            await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
                verificationStatus: 'verified',
                verifiedBy: user.email,
                verifiedAt: new Date().toISOString()
            }, { withCredentials: true });
            
            toast.success('Item verified successfully!');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to verify item');
            console.error(error);
        }
    };

    const handleRejectItem = async (itemId) => {
        try {
            await axios.patch(`http://localhost:3001/api/items/${itemId}`, {
                verificationStatus: 'rejected',
                verifiedBy: user.email,
                verifiedAt: new Date().toISOString()
            }, { withCredentials: true });
            
            toast.success('Item rejected');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to reject item');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-dots loading-lg text-zetech-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zetech-light to-white">
            <Helmet>
                <title>Admin Dashboard | {schoolConfig.name} Lost & Found</title>
            </Helmet>

            {/* Header */}
            <div className="bg-zetech-primary text-white py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-zetech-secondary p-3 rounded-full">
                            <FaShieldAlt className="text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-poppins">Security Office Dashboard</h1>
                            <p className="text-zetech-light opacity-80">Welcome, {user?.displayName || 'Security Officer'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="tabs tabs-boxed bg-white shadow-md mb-6">
                    <button 
                        className={`tab tab-lg ${activeTab === 'overview' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab tab-lg ${activeTab === 'pending' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Verification ({stats.pendingVerification})
                    </button>
                    <button 
                        className={`tab tab-lg ${activeTab === 'all' ? 'tab-active bg-zetech-primary text-white' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Items
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-zetech-primary">
                                <div className="stat-figure text-zetech-primary">
                                    <FaBoxes className="text-3xl" />
                                </div>
                                <div className="stat-title text-gray-500">Total Items</div>
                                <div className="stat-value text-zetech-primary">{stats.totalItems}</div>
                                <div className="stat-desc">All reported items</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
                                <div className="stat-figure text-yellow-500">
                                    <FaClipboardList className="text-3xl" />
                                </div>
                                <div className="stat-title text-gray-500">Pending Verification</div>
                                <div className="stat-value text-yellow-500">{stats.pendingVerification}</div>
                                <div className="stat-desc">Awaiting review</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-green-500">
                                <div className="stat-figure text-green-500">
                                    <FaCheckCircle className="text-3xl" />
                                </div>
                                <div className="stat-title text-gray-500">Verified Items</div>
                                <div className="stat-value text-green-500">{stats.verifiedItems}</div>
                                <div className="stat-desc">Approved listings</div>
                            </div>

                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-zetech-secondary">
                                <div className="stat-figure text-zetech-secondary">
                                    <FaCheckCircle className="text-3xl" />
                                </div>
                                <div className="stat-title text-gray-500">Recovered Items</div>
                                <div className="stat-value text-zetech-secondary">{stats.recoveredItems}</div>
                                <div className="stat-desc">Successfully returned</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-zetech-primary mb-4">Quick Actions</h2>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to="/allItems" 
                                    className="btn bg-zetech-primary hover:bg-zetech-dark text-white"
                                >
                                    View All Items
                                </Link>
                                <Link 
                                    to="/allRecovered" 
                                    className="btn bg-zetech-secondary hover:bg-orange-600 text-white"
                                >
                                    View Recovered Items
                                </Link>
                                <Link 
                                    to="/addItems" 
                                    className="btn btn-outline border-zetech-primary text-zetech-primary hover:bg-zetech-primary hover:text-white"
                                >
                                    Report New Item
                                </Link>
                            </div>
                        </div>

                        {/* Recent Pending Items Preview */}
                        {pendingItems.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-zetech-primary">Recent Pending Items</h2>
                                    <button 
                                        onClick={() => setActiveTab('pending')}
                                        className="text-zetech-secondary hover:underline"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="bg-zetech-light">
                                                <th>Item</th>
                                                <th>Type</th>
                                                <th>Location</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingItems.slice(0, 5).map(item => (
                                                <tr key={item._id} className="hover:bg-gray-50">
                                                    <td className="font-medium">{item.title}</td>
                                                    <td>
                                                        <span className={`badge ${item.postType === 'Lost' ? 'badge-error' : 'badge-success'}`}>
                                                            {item.postType}
                                                        </span>
                                                    </td>
                                                    <td>{item.location}</td>
                                                    <td>{new Date(item.dateLostOrFound).toLocaleDateString()}</td>
                                                    <td className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleVerifyItem(item._id)}
                                                            className="btn btn-xs btn-success text-white"
                                                            title="Verify"
                                                        >
                                                            <FaCheckCircle />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectItem(item._id)}
                                                            className="btn btn-xs btn-error text-white"
                                                            title="Reject"
                                                        >
                                                            <FaTimesCircle />
                                                        </button>
                                                        <Link 
                                                            to={`/items/${item._id}`}
                                                            className="btn btn-xs btn-info text-white"
                                                            title="View Details"
                                                        >
                                                            <FaEye />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Verification Tab */}
                {activeTab === 'pending' && (
                    <PendingItemsTab 
                        items={pendingItems}
                        onVerify={handleVerifyItem}
                        onReject={handleRejectItem}
                        onRefresh={fetchDashboardData}
                    />
                )}

                {/* All Items Tab */}
                {activeTab === 'all' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-zetech-primary mb-4">All Items Management</h2>
                        <p className="text-gray-600 mb-4">
                            View and manage all reported lost and found items.
                        </p>
                        <Link 
                            to="/allItems" 
                            className="btn bg-zetech-primary hover:bg-zetech-dark text-white"
                        >
                            Go to All Items Page
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

// Pending Items Tab Component
const PendingItemsTab = ({ items, onVerify, onReject, onRefresh }) => {
    const [allPendingItems, setAllPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllPendingItems();
    }, []);

    const fetchAllPendingItems = async () => {
        try {
            const res = await axios.get('https://b10a11-server-side-noorjahan220.vercel.app/items');
            const pending = res.data.filter(item => item.verificationStatus === 'pending' || !item.verificationStatus);
            setAllPendingItems(pending);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pending items:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <span className="loading loading-dots loading-lg text-zetech-primary"></span>
            </div>
        );
    }

    if (allPendingItems.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zetech-primary mb-2">All Caught Up!</h3>
                <p className="text-gray-600">There are no items pending verification at this time.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zetech-primary">
                    Pending Verification ({allPendingItems.length} items)
                </h2>
                <button 
                    onClick={() => { fetchAllPendingItems(); onRefresh(); }}
                    className="btn btn-sm btn-outline border-zetech-primary text-zetech-primary"
                >
                    Refresh
                </button>
            </div>
            
            <div className="grid gap-4">
                {allPendingItems.map(item => (
                    <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Item Image */}
                            <div className="w-full md:w-32 h-32 flex-shrink-0">
                                <img 
                                    src={item.thumbnail} 
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            
                            {/* Item Details */}
                            <div className="flex-grow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg text-zetech-primary">{item.title}</h3>
                                        <span className={`badge ${item.postType === 'Lost' ? 'badge-error' : 'badge-success'} mb-2`}>
                                            {item.postType}
                                        </span>
                                    </div>
                                    <span className="badge badge-warning">Pending</span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                                    <p><strong>Category:</strong> {item.category}</p>
                                    <p><strong>Location:</strong> {item.location}</p>
                                    <p><strong>Date:</strong> {new Date(item.dateLostOrFound).toLocaleDateString()}</p>
                                    <p><strong>Reported by:</strong> {item.name}</p>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 justify-end">
                                <button 
                                    onClick={() => { onVerify(item._id); fetchAllPendingItems(); }}
                                    className="btn btn-success text-white flex-1 md:flex-none"
                                >
                                    <FaCheckCircle className="mr-1" /> Verify
                                </button>
                                <button 
                                    onClick={() => { onReject(item._id); fetchAllPendingItems(); }}
                                    className="btn btn-error text-white flex-1 md:flex-none"
                                >
                                    <FaTimesCircle className="mr-1" /> Reject
                                </button>
                                <Link 
                                    to={`/items/${item._id}`}
                                    className="btn btn-info text-white flex-1 md:flex-none"
                                >
                                    <FaEye className="mr-1" /> View
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
