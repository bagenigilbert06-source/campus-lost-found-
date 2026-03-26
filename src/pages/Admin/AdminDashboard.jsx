import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import { FaCheckCircle, FaTimesCircle, FaEye, FaClipboardList, FaShieldAlt, FaBoxes, FaTrash, FaSearch, FaEnvelope, FaReply, FaSignOutAlt } from 'react-icons/fa';
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
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const itemsRes = await axios.get('http://localhost:3001/api/items');
            const items = itemsRes.data;
            
            const messagesRes = await axios.get('http://localhost:3001/api/messages?role=admin', {
                withCredentials: true
            }).catch(() => ({ data: [] }));
            
            const pendingItems = items.filter(item => item.verificationStatus === 'pending' || !item.verificationStatus);
            const verifiedItems = items.filter(item => item.verificationStatus === 'verified');
            const unreadMessages = messagesRes.data?.filter(m => !m.isRead && m.recipientRole === 'admin').length || 0;
            
            setStats({
                totalItems: items.length,
                pendingVerification: pendingItems.length,
                verifiedItems: verifiedItems.length,
                recoveredItems: items.filter(i => i.status === 'recovered').length || 0,
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
                <title>{`Admin Dashboard | ${schoolConfig.name} Lost & Found`}</title>
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
                                <h1 className="text-3xl font-bold">Security Office Dashboard</h1>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-zetech-primary p-4">
                                <div className="stat-figure text-zetech-primary"><FaBoxes className="text-2xl" /></div>
                                <div className="stat-title text-xs">Total Items</div>
                                <div className="stat-value text-lg text-zetech-primary">{stats.totalItems}</div>
                            </div>
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-yellow-500 p-4">
                                <div className="stat-figure text-yellow-500"><FaClipboardList className="text-2xl" /></div>
                                <div className="stat-title text-xs">Pending</div>
                                <div className="stat-value text-lg text-yellow-500">{stats.pendingVerification}</div>
                            </div>
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-4">
                                <div className="stat-figure text-green-500"><FaCheckCircle className="text-2xl" /></div>
                                <div className="stat-title text-xs">Verified</div>
                                <div className="stat-value text-lg text-green-500">{stats.verifiedItems}</div>
                            </div>
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-zetech-secondary p-4">
                                <div className="stat-figure text-zetech-secondary"><FaCheckCircle className="text-2xl" /></div>
                                <div className="stat-title text-xs">Recovered</div>
                                <div className="stat-value text-lg text-zetech-secondary">{stats.recoveredItems}</div>
                            </div>
                            <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-4">
                                <div className="stat-figure text-red-500"><FaEnvelope className="text-2xl" /></div>
                                <div className="stat-title text-xs">Unread</div>
                                <div className="stat-value text-lg text-red-500">{stats.unreadMessages}</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-zetech-primary mb-4">Quick Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/addItems" className="btn bg-zetech-primary hover:bg-zetech-dark text-white btn-sm">
                                    + Report New Item
                                </Link>
                                <button onClick={() => setActiveTab('pending')} className="btn bg-yellow-500 hover:bg-yellow-600 text-white btn-sm">
                                    Review Pending Items
                                </button>
                                <button onClick={() => setActiveTab('messages')} className="btn btn-outline border-zetech-primary text-zetech-primary hover:bg-zetech-primary hover:text-white btn-sm">
                                    <FaEnvelope /> Check Messages
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Tab */}
                {activeTab === 'pending' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-zetech-primary mb-4">Pending Verification ({pendingItems.length})</h2>
                        {pendingItems.length === 0 ? (
                            <div className="text-center py-12"><p className="text-gray-600">No items pending verification</p></div>
                        ) : (
                            <div className="space-y-4">
                                {pendingItems.map(item => (
                                    <div key={item._id} className="border rounded-lg p-4 hover:shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg">{item.title}</h3>
                                                <span className={`badge ${item.itemType === 'Lost' ? 'badge-error' : 'badge-success'}`}>{item.itemType}</span>
                                            </div>
                                            <span className="badge badge-warning">Pending</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleVerifyItem(item._id)} className="btn btn-xs btn-success text-white"><FaCheckCircle /> Verify</button>
                                            <button onClick={() => handleRejectItem(item._id)} className="btn btn-xs btn-error text-white"><FaTimesCircle /> Reject</button>
                                            <button onClick={() => handleDeleteItem(item._id)} className="btn btn-xs btn-outline border-red-500 text-red-500"><FaTrash /> Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* All Items Tab */}
                {activeTab === 'all' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-zetech-primary mb-4">Search & Manage Items ({allItems.length})</h2>
                        <div className="mb-6">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input type="text" placeholder="Search by title, location, or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-8"><p className="text-gray-600">No items found</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-zetech-light"><tr><th>Item</th><th>Type</th><th>Location</th><th>Status</th><th>Verification</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredItems.map(item => (
                                            <tr key={item._id} className="hover:bg-gray-50">
                                                <td className="font-medium">{item.title}</td>
                                                <td><span className={`badge ${item.itemType === 'Lost' ? 'badge-error' : 'badge-success'}`}>{item.itemType}</span></td>
                                                <td>{item.location}</td>
                                                <td><select value={item.status || 'active'} onChange={(e) => handleUpdateStatus(item._id, e.target.value)} className="select select-bordered select-sm"><option value="active">Active</option><option value="recovered">Recovered</option><option value="claimed">Claimed</option></select></td>
                                                <td><span className={`badge ${item.verificationStatus === 'verified' ? 'badge-success' : item.verificationStatus === 'rejected' ? 'badge-error' : 'badge-warning'}`}>{item.verificationStatus || 'pending'}</span></td>
                                                <td><Link to={`/items/${item._id}`} className="btn btn-xs btn-info text-white"><FaEye /></Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto">
                            <h2 className="text-xl font-bold text-zetech-primary mb-4">Messages ({messages.length})</h2>
                            {messages.length === 0 ? (
                                <p className="text-gray-600">No messages</p>
                            ) : (
                                <div className="space-y-2">
                                    {messages.map(msg => (
                                        <button key={msg._id} onClick={() => { setSelectedMessage(msg); if (!msg.isRead) handleMarkMessageAsRead(msg._id); }} className={`w-full text-left p-3 rounded-lg border-l-4 ${selectedMessage?._id === msg._id ? 'bg-zetech-light border-l-zetech-primary' : 'border-l-gray-300'} ${!msg.isRead ? 'font-bold bg-yellow-50' : ''}`}>
                                            <p className="text-sm truncate">{msg.senderEmail}</p>
                                            <p className="text-xs text-gray-600 truncate">{msg.content}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                            {selectedMessage ? (
                                <div>
                                    <div className="mb-6 pb-6 border-b">
                                        <h3 className="text-lg font-bold text-zetech-primary">{selectedMessage.senderEmail}</h3>
                                        <p className="text-gray-700 text-sm mt-4">{selectedMessage.content}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zetech-primary mb-3">Send Reply</h4>
                                        <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Type your reply here..." className="textarea textarea-bordered w-full mb-3" rows="4"></textarea>
                                        <button onClick={() => handleReplyMessage(selectedMessage._id, selectedMessage.conversationId)} className="btn bg-zetech-primary hover:bg-zetech-dark text-white w-full">Send Reply</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12"><p className="text-gray-600">Select a message to view details</p></div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
