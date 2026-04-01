import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import toast from 'react-hot-toast';
import { messagesService } from '../../services/apiService';
import { FaChevronLeft, FaEnvelope, FaSearch, FaSync, FaTrash, FaPaperPlane, FaUser, FaUserShield } from 'react-icons/fa';
import MessageBubble from '../../components/MessageBubble';
import LoadingScreen from '../../components/LoadingScreen';

const DashboardMessages = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [composerText, setComposerText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversationId, conversations]);

  const normalizePayload = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.messages)) return payload.messages;
    return [];
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getMessages({ limit: 500 });
      const messages = normalizePayload(response);

      const map = new Map();
      messages
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .forEach((msg) => {
          const cid = msg.conversationId || msg._id;
          if (!cid) return;

          if (!map.has(cid)) {
            map.set(cid, {
              conversationId: cid,
              itemId: msg.itemId || 'N/A',
              participants: Array.from(new Set([msg.senderEmail, msg.recipientEmail].filter(Boolean))),
              studentEmail: msg.senderRole === 'student' ? msg.senderEmail : msg.recipientEmail,
              adminEmail: msg.senderRole === 'admin' ? msg.senderEmail : msg.recipientEmail,
              messages: [],
              unreadCount: 0,
              lastMessage: msg,
            });
          }

          const convo = map.get(cid);
          convo.messages.push(msg);
          convo.lastMessage = new Date(convo.lastMessage?.createdAt) > new Date(msg.createdAt) ? convo.lastMessage : msg;

          if (msg.recipientEmail === user?.email && !msg.isRead) {
            convo.unreadCount += 1;
          }
        });

      const sorted = Array.from(map.values())
        .map((c) => ({
          ...c,
          messages: c.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
          lastMessage: c.lastMessage,
        }))
        .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

      setConversations(sorted);

      if (!selectedConversationId && sorted.length > 0) {
        setSelectedConversationId(sorted[0].conversationId);
      }
    } catch (error) {
      console.error('[DashboardMessages] fetchConversations error:', error);
      toast.error('Unable to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.conversationId === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const markConversationAsRead = async (conversation) => {
    if (!conversation || conversation.unreadCount === 0) return;

    const unreadMessages = conversation.messages.filter((m) => m.recipientEmail === user?.email && !m.isRead);

    await Promise.all(
      unreadMessages.map((m) => messagesService.markAsRead(m._id).catch((e) => console.warn(e)))
    );

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conversation.conversationId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, isRead: true })),
            }
          : c
      )
    );
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    const conversation = conversations.find((c) => c.conversationId === conversationId);
    markConversationAsRead(conversation);
  };

  const handleSendMessage = async () => {
    if (!composerText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const draftMessage = composerText.trim();
      const lastMessage = selectedConversation.messages[selectedConversation.messages.length - 1];

      const sendResult = await messagesService.replyToMessage(lastMessage?._id || selectedConversation.conversationId, draftMessage);
      const newMsg = sendResult?.data || sendResult?.data?.data || sendResult?.data?.message || sendResult;

      const messageToAdd = {
        ...newMsg,
        senderEmail: user?.email,
        senderRole: user?.role || 'student',
        recipientEmail: selectedConversation.adminEmail || 'admin@zetech.ac.ke',
        recipientRole: 'admin',
        content: draftMessage,
        createdAt: new Date().toISOString(),
        _id: newMsg?._id || `${Date.now()}-${Math.random()}`,
        isRead: false,
        conversationId: selectedConversation.conversationId,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.conversationId !== selectedConversation.conversationId) return c;
          const updatedMessages = [...c.messages, messageToAdd];
          return {
            ...c,
            messages: updatedMessages,
            lastMessage: messageToAdd,
          };
        })
      );

      setComposerText('');
      scrollToBottom();
    } catch (error) {
      console.error('[DashboardMessages] send message failed:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleConversationDelete = async (conversationId) => {
    if (!window.confirm('Delete this entire conversation?')) return;
    try {
      const conversation = conversations.find((c) => c.conversationId === conversationId);
      if (!conversation) return;
      await Promise.all(conversation.messages.map((m) => messagesService.deleteMessage(m._id).catch(() => null)));
      const nextConversations = conversations.filter((c) => c.conversationId !== conversationId);
      setConversations(nextConversations);
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(nextConversations[0]?.conversationId || null);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('[DashboardMessages] delete conversation failed:', error);
      toast.error('Could not delete conversation');
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const lower = searchTerm.toLowerCase();
    return conversations.filter((c) => {
      const name = c.participants.join(' ').toLowerCase();
      const preview = c.lastMessage?.content?.toLowerCase() || '';
      return name.includes(lower) || preview.includes(lower) || c.itemId?.toLowerCase().includes(lower);
    });
  }, [conversations, searchTerm]);

  if (loading) {
    return <LoadingScreen message="Loading conversations..." />;
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Messages - {schoolConfig.name} Lost & Found</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Chat Inbox</h1>
            <p className="text-sm text-slate-500">
              {`You have ${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}.`}
            </p>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchConversations();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 h-[calc(100vh-170px)]">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <FaSearch className="text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-transparent outline-none text-sm text-slate-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-slate-500">
                  <div className="text-center">
                    <FaEnvelope className="mx-auto mb-2 text-xl" />
                    <p>No conversations found</p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const active = conversation.conversationId === selectedConversationId;
                  const preview = conversation.lastMessage?.content || 'No messages yet';
                  const dateTag = new Date(conversation.lastMessage?.createdAt || Date.now()).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <button
                      key={conversation.conversationId}
                      onClick={() => handleSelectConversation(conversation.conversationId)}
                      className={`w-full text-left p-3 border-b border-slate-100 flex items-start gap-3 transition ${active ? 'bg-emerald-50 text-slate-900' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${conversation.lastMessage?.senderRole === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {conversation.studentEmail?.charAt(0)?.toUpperCase() || conversation.adminEmail?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate">{conversation.studentEmail || conversation.adminEmail || 'Unknown'}</p>
                          <p className="text-xs text-slate-400 whitespace-nowrap">{dateTag}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 truncate">{preview}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center mt-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="px-4 py-3 border-b border-slate-200 sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-full grid place-items-center text-white ${selectedConversation.lastMessage?.senderRole === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                        {selectedConversation.studentEmail?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedConversation.studentEmail || 'Conversation'}</p>
                        <p className="text-xs text-slate-500">{selectedConversation.participants.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markConversationAsRead(selectedConversation)}
                        className="text-xs px-2 py-1 bg-slate-100 rounded-md hover:bg-slate-200"
                      >
                        Mark read
                      </button>
                      <button
                        onClick={() => handleConversationDelete(selectedConversation.conversationId)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ minHeight: 0 }}>
                  {selectedConversation.messages.map((message, index) => {
                    const isCurrentUser = message.senderEmail === user?.email;
                    const prevMessage = selectedConversation.messages[index - 1];
                    const showSender = !prevMessage || prevMessage.senderEmail !== message.senderEmail;

                    return (
                      <div key={message._id} className={`${isCurrentUser ? 'justify-end flex' : 'justify-start flex'}`}>
                        <div className={`w-full md:w-3/4 ${!isCurrentUser ? 'text-left' : 'text-right'}`}>
                          {showSender && (
                            <p className={`text-xs font-semibold ${isCurrentUser ? 'text-emerald-700' : 'text-blue-700'} mb-1`}>
                              {isCurrentUser ? 'You' : (message.senderRole === 'admin' ? 'Admin' : 'Student')}
                            </p>
                          )}
                          <MessageBubble
                            message={message}
                            isCurrentUser={isCurrentUser}
                            showRole={false}
                            className="max-w-full"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200 p-3 sticky bottom-0 bg-white">
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Write a message..."
                      className="flex-1 min-h-[60px] rounded-xl border border-slate-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!composerText.trim() || sending}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <FaPaperPlane size={14} />}
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-center p-8 text-slate-500">
                <div>
                  <FaEnvelope className="mx-auto mb-3 text-3xl" />
                  <p className="font-semibold">No conversation selected</p>
                  <p className="text-sm mt-1">Choose a conversation on the left to continue</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMessages;
