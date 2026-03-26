import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { FaBox, FaClipboard, FaEnvelope, FaSignOutAlt, FaUser, FaSearch, FaHistory, FaBell, FaPlus, FaCheckCircle, FaHourglass, FaTimesCircle } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import axios from 'axios';

const StudentDashboard = () => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    claimsSubmitted: 0,
    claimsApproved: 0,
    claimsPending: 0,
    itemsFound: 0,
    unreadMessages: 0,
  });
  const [claims, setClaims] = useState([]);
  const [messages, setMessages] = useState([]);
  const [itemsFound, setItemsFound] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Fetch user statistics
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch claims
        const claimsRes = await axios.get('http://localhost:3001/api/claims', {
          params: { studentEmail: user.email },
          withCredentials: true
        }).catch(() => ({ data: [] }));
        
        // Fetch messages
        const messagesRes = await axios.get('http://localhost:3001/api/messages', {
          params: { senderEmail: user.email },
          withCredentials: true
        }).catch(() => ({ data: [] }));
        
        // Fetch items found by student
        const itemsRes = await axios.get('http://localhost:3001/api/items', {
          params: { foundByEmail: user.email },
          withCredentials: true
        }).catch(() => ({ data: [] }));

        const claimsData = claimsRes.data || [];
        const messagesData = messagesRes.data || [];
        const itemsData = itemsRes.data || [];

        setClaims(claimsData);
        setMessages(messagesData);
        setItemsFound(itemsData);

        setUserStats({
          claimsSubmitted: claimsData.length,
          claimsApproved: claimsData.filter(c => c.status === 'approved').length,
          claimsPending: claimsData.filter(c => c.status === 'pending').length,
          itemsFound: itemsData.length,
          unreadMessages: messagesData.filter(m => !m.isRead && m.recipientEmail === user.email).length,
        });
      } catch (error) {
        console.error('[v0] Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        toast.success('Signed out successfully');
        navigate('/signin');
      })
      .catch((error) => {
        toast.error('Error signing out');
        console.error('[v0] Sign out error:', error);
      });
  };

  const handleMarkMessageAsRead = async (messageId) => {
    try {
      await axios.patch(`http://localhost:3001/api/messages/${messageId}`, {
        isRead: true,
        readAt: new Date().toISOString()
      }, { withCredentials: true });
      
      setMessages(messages.map(m => m._id === messageId ? { ...m, isRead: true } : m));
    } catch (error) {
      console.error('[v0] Error marking message as read:', error);
    }
  };

  const handleSendReply = async (messageId, conversationId) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/messages', {
        conversationId,
        content: replyContent,
        senderRole: 'student'
      }, { withCredentials: true });

      toast.success('Reply sent successfully');
      setReplyContent('');
      setSelectedMessage(null);
    } catch (error) {
      toast.error('Failed to send reply');
      console.error(error);
    }
  };

  const handleWithdrawClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to withdraw this claim?')) return;

    try {
      await axios.patch(`http://localhost:3001/api/claims/${claimId}`, {
        status: 'withdrawn'
      }, { withCredentials: true });

      toast.success('Claim withdrawn');
      setClaims(claims.filter(c => c._id !== claimId));
    } catch (error) {
      toast.error('Failed to withdraw claim');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-dots loading-lg text-teal-600"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Helmet>
        <title>Student Dashboard - {schoolConfig.name}</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">{schoolConfig.shortName}</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.displayName || 'Student'}</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link 
              to="/user-profile" 
              className="btn btn-sm btn-outline border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
            >
              <FaUser /> Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="tabs tabs-boxed bg-white shadow-md mb-6 flex flex-wrap">
          <button 
            className={`tab ${activeTab === 'overview' ? 'tab-active bg-teal-600 text-white' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'search' ? 'tab-active bg-teal-600 text-white' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <FaSearch /> Search Items
          </button>
          <button 
            className={`tab ${activeTab === 'claims' ? 'tab-active bg-teal-600 text-white' : ''}`}
            onClick={() => setActiveTab('claims')}
          >
            <FaClipboard /> My Claims ({userStats.claimsSubmitted})
          </button>
          <button 
            className={`tab ${activeTab === 'messages' ? 'tab-active bg-teal-600 text-white' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <FaEnvelope /> Inbox {userStats.unreadMessages > 0 && <span className="badge badge-error ml-2">{userStats.unreadMessages}</span>}
          </button>
          <button 
            className={`tab ${activeTab === 'items-found' ? 'tab-active bg-teal-600 text-white' : ''}`}
            onClick={() => setActiveTab('items-found')}
          >
            <FaBox /> Items Found ({userStats.itemsFound})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-teal-600 p-4">
                <div className="stat-figure text-teal-600">
                  <FaClipboard className="text-2xl" />
                </div>
                <div className="stat-title text-xs text-gray-500">Claims Submitted</div>
                <div className="stat-value text-lg text-teal-600">{userStats.claimsSubmitted}</div>
              </div>

              <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-green-500 p-4">
                <div className="stat-figure text-green-500">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <div className="stat-title text-xs text-gray-500">Approved</div>
                <div className="stat-value text-lg text-green-500">{userStats.claimsApproved}</div>
              </div>

              <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-yellow-500 p-4">
                <div className="stat-figure text-yellow-500">
                  <FaHourglass className="text-2xl" />
                </div>
                <div className="stat-title text-xs text-gray-500">Pending</div>
                <div className="stat-value text-lg text-yellow-500">{userStats.claimsPending}</div>
              </div>

              <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-4">
                <div className="stat-figure text-blue-500">
                  <FaBox className="text-2xl" />
                </div>
                <div className="stat-title text-xs text-gray-500">Items Found</div>
                <div className="stat-value text-lg text-blue-500">{userStats.itemsFound}</div>
              </div>

              <div className="stat bg-white rounded-xl shadow-lg border-l-4 border-red-500 p-4">
                <div className="stat-figure text-red-500">
                  <FaEnvelope className="text-2xl" />
                </div>
                <div className="stat-title text-xs text-gray-500">Unread</div>
                <div className="stat-value text-lg text-red-500">{userStats.unreadMessages}</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-teal-600 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/search-items" 
                  className="btn bg-teal-600 hover:bg-teal-700 text-white btn-sm"
                >
                  <FaSearch /> Search Lost Items
                </Link>
                <Link 
                  to="/addItems" 
                  className="btn bg-blue-600 hover:bg-blue-700 text-white btn-sm"
                >
                  <FaPlus /> Report Found Item
                </Link>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="btn btn-outline border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white btn-sm"
                >
                  <FaEnvelope /> Check Messages
                </button>
                <Link 
                  to="/notification-settings" 
                  className="btn btn-outline border-gray-400 text-gray-600 hover:bg-gray-100 btn-sm"
                >
                  <FaBell /> Notifications
                </Link>
              </div>
            </div>

            {/* Recent Claims */}
            {claims.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-teal-600 mb-4">Recent Claims</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {claims.slice(0, 5).map(claim => (
                    <div key={claim._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{claim.itemTitle}</p>
                        <p className="text-xs text-gray-600">{new Date(claim.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge ${
                        claim.status === 'approved' ? 'badge-success' :
                        claim.status === 'pending' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-teal-600 mb-4">Search for Lost Items</h2>
            <p className="text-gray-600 mb-4">Looking for your lost item? Use the search page to browse all reported found items.</p>
            <Link 
              to="/search-items" 
              className="btn bg-teal-600 hover:bg-teal-700 text-white"
            >
              <FaSearch /> Go to Search
            </Link>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-teal-600 mb-4">My Claims ({claims.length})</h2>
            
            {claims.length === 0 ? (
              <div className="text-center py-12">
                <FaClipboard className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No claims yet</p>
                <Link to="/search-items" className="btn bg-teal-600 text-white">
                  Search for Items
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {claims.map(claim => (
                  <div key={claim._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{claim.itemTitle}</h3>
                        <p className="text-sm text-gray-600">{claim.itemCategory}</p>
                      </div>
                      <span className={`badge ${
                        claim.status === 'approved' ? 'badge-success' :
                        claim.status === 'pending' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{claim.ownershipProof}</p>
                    
                    <div className="flex gap-2 text-xs text-gray-500 mb-4">
                      <span>Claimed: {new Date(claim.createdAt).toLocaleDateString()}</span>
                      {claim.respondedAt && <span>Responded: {new Date(claim.respondedAt).toLocaleDateString()}</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      {claim.status === 'pending' && (
                        <>
                          <Link 
                            to={`/claim/${claim._id}`}
                            className="btn btn-xs btn-info text-white"
                          >
                            View Details
                          </Link>
                          <button 
                            onClick={() => handleWithdrawClaim(claim._id)}
                            className="btn btn-xs btn-outline border-red-500 text-red-500"
                          >
                            Withdraw
                          </button>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <span className="badge badge-success">Item Ready for Collection</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold text-teal-600 mb-4">Inbox ({messages.length})</h2>
              
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map(msg => (
                    <button
                      key={msg._id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.isRead) handleMarkMessageAsRead(msg._id);
                      }}
                      className={`w-full text-left p-3 rounded-lg border-l-4 transition-colors ${
                        selectedMessage?._id === msg._id 
                          ? 'bg-teal-100 border-l-teal-600' 
                          : 'border-l-gray-300 hover:bg-gray-50'
                      } ${!msg.isRead ? 'font-bold bg-yellow-50' : ''}`}
                    >
                      <p className="text-sm font-semibold text-gray-900 truncate">From: Security Office</p>
                      <p className="text-xs text-gray-600 truncate">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
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
                        <h3 className="text-lg font-bold text-teal-600">Message from Security Office</h3>
                        <p className="text-xs text-gray-600">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                      </div>
                      {!selectedMessage.isRead && (
                        <span className="badge badge-warning">Unread</span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedMessage.content}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-teal-600 mb-3">Send Reply</h4>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your response here..."
                      className="textarea textarea-bordered w-full mb-3"
                      rows="4"
                    ></textarea>
                    <button
                      onClick={() => handleSendReply(selectedMessage._id, selectedMessage.conversationId)}
                      className="btn bg-teal-600 hover:bg-teal-700 text-white w-full"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Select a message to read</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items Found Tab */}
        {activeTab === 'items-found' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-teal-600 mb-4">Items I've Reported as Found ({itemsFound.length})</h2>
            
            {itemsFound.length === 0 ? (
              <div className="text-center py-12">
                <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't reported any found items yet</p>
                <Link to="/addItems" className="btn bg-teal-600 text-white">
                  Report Found Item
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {itemsFound.map(item => (
                  <div key={item._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {item.images?.[0] && (
                        <img 
                          src={item.images[0]} 
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                          <span className={`badge ${item.status === 'active' ? 'badge-info' : item.status === 'recovered' ? 'badge-success' : 'badge-error'}`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">Location: {item.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Link 
                        to={`/items/${item._id}`}
                        className="btn btn-xs btn-info text-white"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/update-item/${item._id}`}
                        className="btn btn-xs btn-outline border-teal-600 text-teal-600"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Fetch user statistics
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        // Placeholder - replace with actual API calls
        setUserStats({
          claimsSubmitted: 2,
          claimsApproved: 1,
          itemsFound: 0,
          unreadMessages: 3,
        });
      } catch (error) {
        console.error('[v0] Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, navigate]);

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        toast.success('Signed out successfully');
        navigate('/signin');
      })
      .catch((error) => {
        toast.error('Error signing out');
        console.error('[v0] Sign out error:', error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <Helmet>
        <title>Student Dashboard - {schoolConfig.name}</title>
      </Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{schoolConfig.shortName}</h1>
            <p className="text-sm text-gray-600">Student Portal - Lost & Found</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.displayName || 'Student'}</h2>
          <p className="text-gray-600">
            Use this portal to search for lost items, track your claims, and communicate with the Lost & Found office.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FaBox className="text-2xl" />}
            title="Claims Submitted"
            value={userStats.claimsSubmitted}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FaClipboard className="text-2xl" />}
            title="Claims Approved"
            value={userStats.claimsApproved}
            color="bg-green-500"
          />
          <StatCard
            icon={<FaUser className="text-2xl" />}
            title="Items Found"
            value={userStats.itemsFound}
            color="bg-purple-500"
          />
          <StatCard
            icon={<FaEnvelope className="text-2xl" />}
            title="Unread Messages"
            value={userStats.unreadMessages}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Search Lost Items"
              description="Browse all items found on campus"
              icon={<FaBox className="text-3xl" />}
              link="/search"
              buttonText="Search Now"
            />
            <ActionCard
              title="My Claims"
              description="Track items you've claimed"
              icon={<FaClipboard className="text-3xl" />}
              link="/my-claims"
              buttonText="View Claims"
            />
            <ActionCard
              title="Messages"
              description="Chat with Lost & Found office"
              icon={<FaEnvelope className="text-3xl" />}
              link="/messages"
              buttonText="Check Messages"
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step="1"
              title="Search"
              description="Browse the collection of lost and found items on campus"
            />
            <StepCard
              step="2"
              title="Claim"
              description="Found your item? Click 'Claim Item' to initiate the verification process"
            />
            <StepCard
              step="3"
              title="Verify & Collect"
              description="Chat with office staff to verify ownership and arrange pickup"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need Help?</h3>
          <p className="mb-4">
            Contact the Lost & Found office for assistance with your claims or to report a lost item.
          </p>
          <div className="flex gap-4">
            <a href={`mailto:${schoolConfig.contactEmail}`} className="px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Email Office
            </a>
            <a href={`tel:${schoolConfig.contactPhone}`} className="px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition">
              Call Office
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-gray-200 hover:shadow-lg transition">
    <div className={`${color} text-white p-3 rounded-lg w-fit mb-3`}>
      {icon}
    </div>
    <h3 className="text-gray-600 text-sm font-semibold mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

// Action Card Component
const ActionCard = ({ title, description, icon, link, buttonText }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between border-l-4 border-teal-400 hover:shadow-lg transition">
    <div className="mb-4">
      <div className="text-teal-500 mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
    <Link
      to={link}
      className="inline-block px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition text-center"
    >
      {buttonText}
    </Link>
  </div>
);

// Step Card Component
const StepCard = ({ step, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mb-4">
      {step}
    </div>
    <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default StudentDashboard;
