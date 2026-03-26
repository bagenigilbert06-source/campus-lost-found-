import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/Authcontext/AuthContext';
import { schoolConfig } from '../../config/schoolConfig';
import { FaCheckCircle, FaTimesCircle, FaEye, FaClipboardList, FaShieldAlt, FaUsers, FaBoxes } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalItems: 0,
        pendingVerification: 0,
        verifiedItems: 0,
        recoveredItems: 0,
        totalUsers: 0
    });
    const [pendingItems, setPendingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Try to fetch from dedicated admin stats endpoint first
            try {
                const statsRes = await axios.get(`${API_URL}/admin/stats`);
                const adminStats = statsRes.data?.data;
                
                if (adminStats) {
                    setStats({
                        totalItems: adminStats.totalItems,
                        pendingVerification: adminStats.pendingVerification,
                        verifiedItems: adminStats.verifiedItems,
                        recoveredItems: adminStats.recoveredItems,
                        totalUsers: adminStats.totalUsers
                    });
                    setLoading(false);
                    return;
                }
            } catch (statsError) {
                console.warn('Admin stats endpoint not available, falling back to items endpoint');
            }
            
            // Fallback: Fetch all items manually
            const itemsRes = await axios.get(`${API_URL}/items`, {
                params: { limit: 1000 }
            });
            
            const items = Array.isArray(itemsRes.data) 
                ? itemsRes.data 
                : (itemsRes.data?.data || []);
            
            const pendingItems = items.filter(item => item.verificationStatus === 'pending' || !item.verificationStatus);
            const verifiedItems = items.filter(item => item.verificationStatus === 'verified');
            const recoveredItems = items.filter(item => item.status === 'recovered');
            const uniqueUsers = new Set(items.map(item => item.email).filter(Boolean));
            
            setStats({
                totalItems: items.length,
                pendingVerification: pendingItems.length,
                verifiedItems: verifiedItems.length,
                recoveredItems: recoveredItems.length,
                totalUsers: uniqueUsers.size
            });
            
            setPendingItems(pendingItems.slice(0, 10));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const handleVerifyItem = async (itemId) => {
        try {
            await axios.put(`${API_URL}/items/${itemId}`, {
                verificationStatus: 'verified',
                verifiedBy: user?.email,
                verifiedAt: new Date().toISOString()
            });
            
            toast.success('Item verified successfully!');
            fetchDashboardData();
        } catch (error) {
            toast.error('Failed to verify item');
            console.error(error);
        }
    };

    const handleRejectItem = async (itemId) => {
        try {
            await axios.put(`${API_URL}/items/${itemId}`, {
                verificationStatus: 'rejected',
                verifiedBy: user?.email,
                verifiedAt: new Date().toISOString()
            });
            
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
