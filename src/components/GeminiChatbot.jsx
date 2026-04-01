import React, { useState, useRef, useEffect, useContext, useCallback, memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { 
  FaTimes, 
  FaArrowUp, 
  FaTrash, 
  FaEdit, 
  FaCopy, 
  FaThumbsUp, 
  FaThumbsDown,
  FaDownload,
  FaHistory,
  FaTrophy,
  FaUndoAlt,
  FaEllipsisV,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import axios from "axios";
import toast from "react-hot-toast";
import { getIdToken } from "firebase/auth";
import auth from "../firebase/firebase.init.js";
import AuthContext from "../context/Authcontext/AuthContext";

const GeminiMark = memo(function GeminiMark({ className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="absolute h-3.5 w-3.5 rotate-45 rounded-[0.4rem] bg-emerald-400/90" />
      <div className="absolute h-3.5 w-3.5 rounded-[0.4rem] bg-emerald-500/90 blur-[2px]" />
      <div className="relative flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
        <HiOutlineSparkles className="text-sm text-white" />
      </div>
    </div>
  );
});

// Premium Message Renderer for clean, organized content
const RichMessageRenderer = memo(function RichMessageRenderer({ text, isUserMessage }) {
  // Parse and format different content types
  const parseContent = (content) => {
    // Split by double newlines to create sections
    const sections = content.split('\n\n').filter(s => s.trim());
    
    return sections.map((section, idx) => {
      section = section.trim();
      
      // Check for numbered lists
      if (/^\d+\.\s/.test(section)) {
        const items = section.split('\n').filter(s => s.trim());
        return (
          <ol key={idx} className="list-decimal list-inside space-y-2 my-3 pl-2">
            {items.map((item, i) => (
              <li key={i} className="text-slate-700 leading-relaxed">
                {item.replace(/^\d+\.\s*/, '').trim()}
              </li>
            ))}
          </ol>
        );
      }
      
      // Check for bullet lists
      if (/^[-•*]\s/.test(section)) {
        const items = section.split('\n').filter(s => s.trim());
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 my-3 pl-2">
            {items.map((item, i) => (
              <li key={i} className="text-slate-700 leading-relaxed">
                {item.replace(/^[-•*]\s*/, '').trim()}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check for code blocks
      if (section.includes('```')) {
        const codeMatch = section.match(/```(\w+)?\n([\s\S]*?)\n```/);
        if (codeMatch) {
          return (
            <pre key={idx} className="bg-slate-900 text-slate-50 rounded-lg px-4 py-3 overflow-x-auto my-3 text-xs font-mono border border-slate-700">
              <code>{codeMatch[2]}</code>
            </pre>
          );
        }
      }
      
      // Check for bold/emphasis markers
      let formattedText = section
        .replace(/\*\*(.*?)\*\*/g, '<strong className="font-semibold text-slate-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em className="italic">$1</em>')
        .replace(/__([^_]+)__/g, '<strong className="font-bold">$1</strong>');
      
      // Detect headers (lines starting with #)
      if (section.startsWith('#')) {
        const level = section.match(/^#+/)[0].length;
        const headerText = section.replace(/^#+\s*/, '');
        const sizeClasses = {
          1: 'text-lg font-bold text-slate-900',
          2: 'text-base font-semibold text-slate-800',
          3: 'text-sm font-semibold text-slate-800'
        };
        return (
          <h3 key={idx} className={`${sizeClasses[Math.min(level, 3)] || 'font-semibold'} mb-2 mt-3`}>
            {headerText}
          </h3>
        );
      }
      
      // Regular paragraph with enhanced formatting
      return (
        <p key={idx} className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap break-words mb-3 last:mb-0">
          {section}
        </p>
      );
    });
  };

  return (
    <div className={`${isUserMessage ? 'text-white' : 'text-slate-900'}`}>
      {isUserMessage ? (
        // Simple clean format for user messages
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {text}
        </p>
      ) : (
        // Rich formatted content for bot messages
        <div className="space-y-2">
          {parseContent(text)}
        </div>
      )}
    </div>
  );
});

const suggestedPrompts = [
  "How do I post a lost item?",
  "How can I report found items?",
  "What's the claiming process?",
  "How do I search for items?",
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

// Local storage keys
const STORAGE_KEYS = {
  messages: "gemini_chat_messages",
  sessionId: "gemini_chat_session",
  rateLimitReset: "gemini_rate_limit_reset",
  conversations: "gemini_chat_conversations",
  messageRatings: "gemini_message_ratings",
};

const GeminiChatbot = ({ isAuthenticated = false, context = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const [typingMessage, setTypingMessage] = useState("");
  const [lastFallbackUsed, setLastFallbackUsed] = useState(false);
  
  // New features state
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState(null);
  const [messageRatings, setMessageRatings] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [messageUndoStack, setMessageUndoStack] = useState([]);
  const [failedMessages, setFailedMessages] = useState({});

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const rateLimitTimerRef = useRef(null);
  const menuRef = useRef({});

  const { user } = useContext(AuthContext);
  const reduceMotion = useReducedMotion();

  // Helper function to safely convert timestamp to Date object
  const getDateFromTimestamp = (timestamp) => {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date();
  };

  // New Feature Handlers
  
  // Delete message with confirmation
  const handleDeleteMessage = (messageId) => {
    if (showDeleteConfirm === messageId) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setShowDeleteConfirm(null);
      toast.success("Message deleted");
    } else {
      setShowDeleteConfirm(messageId);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  // Start editing a message
  const handleStartEdit = (message) => {
    setEditingId(message.id);
    setEditingText(message.text);
  };

  // Save edited message
  const handleSaveEdit = async (messageId) => {
    if (!editingText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: editingText, edited: true, editedAt: new Date() }
        : msg
    ));
    
    setEditingId(null);
    setEditingText("");
    toast.success("Message updated");
  };

  // Copy message to clipboard
  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Message copied!");
    });
  };

  // Rate message
  const handleRateMessage = (messageId, rating) => {
    setMessageRatings(prev => ({
      ...prev,
      [messageId]: prev[messageId] === rating ? null : rating
    }));
  };

  // Search messages
  const getFilteredMessages = () => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.text.toLowerCase().includes(query)
    );
  };

  // Export chat as text
  const handleExportChat = () => {
    const chatText = messages
      .map(msg => {
        const time = getDateFromTimestamp(msg.timestamp).toLocaleTimeString();
        const sender = msg.sender === "user" ? "You" : "Gemini Assistant";
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join("\n\n");
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(chatText));
    element.setAttribute("download", `chat-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Chat exported!");
  };

  // Export chat as JSON
  const handleExportJSON = () => {
    const chatData = {
      exportDate: new Date().toISOString(),
      messagesCount: messages.length,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    };
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatData, null, 2)));
    element.setAttribute("download", `chat-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Chat exported as JSON!");
  };

  // Save conversation to history
  const handleSaveConversation = () => {
    if (messages.length === 0) {
      toast.error("No messages to save");
      return;
    }
    
    const newConversation = {
      id: `conv-${Date.now()}`,
      title: messages[0]?.text?.substring(0, 50) || "New Conversation",
      messages: [...messages],
      createdAt: new Date(),
      messageCount: messages.length
    };
    
    setConversations(prev => [newConversation, ...prev]);
    toast.success("Conversation saved!");
  };

  // Load a conversation from history
  const handleLoadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setShowHistory(false);
    setShowWelcome(false);
  };

  // Delete conversation from history
  const handleDeleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
      setShowWelcome(true);
    }
    toast.success("Conversation deleted");
  };

  // Undo last message
  const handleUndo = () => {
    if (messages.length > 0) {
      setMessageUndoStack(prev => [...prev, ...messages]);
      setMessages(prev => prev.slice(0, -1));
      toast.success("Message removed");
    }
  };

  // Retry failed message
  const handleRetryMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setFailedMessages(prev => {
        const updated = { ...prev };
        delete updated[messageId];
        return updated;
      });
      toast.success("Retrying message...");
    }
  };

  // Format time for tooltip
  const formatFullDate = (timestamp) => {
    const date = getDateFromTimestamp(timestamp);
    return date.toLocaleString();
  };

  // Load persisted data on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEYS.messages);
    const savedSessionId = localStorage.getItem(STORAGE_KEYS.sessionId);
    const savedRateLimitReset = localStorage.getItem(STORAGE_KEYS.rateLimitReset);
    const savedConversations = localStorage.getItem(STORAGE_KEYS.conversations);
    const savedRatings = localStorage.getItem(STORAGE_KEYS.messageRatings);

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg) => ({
          ...msg,
          timestamp: getDateFromTimestamp(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error("Failed to parse saved messages:", e);
      }
    }

    // Load conversations
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const conversationsWithDates = parsed.map(conv => ({
          ...conv,
          createdAt: getDateFromTimestamp(conv.createdAt),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: getDateFromTimestamp(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
      } catch (e) {
        console.error("Failed to parse conversations:", e);
      }
    }

    // Load message ratings
    if (savedRatings) {
      try {
        const parsed = JSON.parse(savedRatings);
        setMessageRatings(parsed);
      } catch (e) {
        console.error("Failed to parse ratings:", e);
      }
    }

    const newSessionId = savedSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    localStorage.setItem(STORAGE_KEYS.sessionId, newSessionId);
    setCurrentConversationId(newSessionId);

    // Check if rate limit is still active
    if (savedRateLimitReset) {
      const resetTime = Number(savedRateLimitReset);
      const now = Date.now();
      if (resetTime > now) {
        const remainingMs = resetTime - now;
        setRateLimitCooldown(Math.ceil(remainingMs / 1000));
        startRateLimitTimer(remainingMs);
      } else {
        localStorage.removeItem(STORAGE_KEYS.rateLimitReset);
      }
    }

    setShowWelcome(savedMessages ? false : true);
  }, []);

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    }
  }, [messages]);

  // Persist conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Persist message ratings
  useEffect(() => {
    if (Object.keys(messageRatings).length > 0) {
      localStorage.setItem(STORAGE_KEYS.messageRatings, JSON.stringify(messageRatings));
    }
  }, [messageRatings]);

  // Rate limit cooldown timer
  const startRateLimitTimer = (milliseconds) => {
    if (rateLimitTimerRef.current) {
      clearInterval(rateLimitTimerRef.current);
    }

    const endTime = Date.now() + milliseconds;
    rateLimitTimerRef.current = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setRateLimitCooldown(0);
        clearInterval(rateLimitTimerRef.current);
        localStorage.removeItem(STORAGE_KEYS.rateLimitReset);
      } else {
        setRateLimitCooldown(Math.ceil(remaining / 1000));
      }
    }, 1000);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [reduceMotion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingMessage, scrollToBottom]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 110)}px`;
  }, [inputValue]);

  const handleOpenChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setShowWelcome(true);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    setShowWelcome(messages.length === 0);
    setError(null);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (prompt) => {
    setShowWelcome(false);
    setInputValue(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowWelcome(true);
    setError(null);
    setTypingMessage("");
    localStorage.removeItem(STORAGE_KEYS.messages);
  };

  const getFirebaseToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await getIdToken(currentUser);
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
    }
    return null;
  };

  const buildContext = () => {
    if (isAuthenticated && user) {
      return `User is authenticated. ${context || ""}`.trim();
    }
    return `User is browsing public pages. ${context || ""}`.trim();
  };

  // Simulate typing animation
  const typeMessage = async (fullText, messageId) => {
    let current = "";
    const typingSpeed = 5; // ms per character

    for (let i = 0; i < fullText.length; i++) {
      current += fullText[i];
      setTypingMessage(current);
      await new Promise((resolve) => setTimeout(resolve, typingSpeed));
    }

    // Add the complete message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        text: fullText,
        sender: "bot",
        timestamp: new Date(),
        fallbackUsed: lastFallbackUsed,
      },
    ]);

    setTypingMessage("");
  };

  /**
   * Handle AI service errors (checks response data for error codes)
   * The backend now returns 200 status for all responses, with error details in data.code
   */
  const handleAIError = (data, httpStatus) => {
    const errorCode = data?.code;
    const errorMessage = data?.error || data?.message;

    console.log("[Chatbot] AI Error:", { code: errorCode, httpStatus, message: errorMessage });

    // Handle different error codes from response data
    if (errorCode === 'RATE_LIMIT' || data?.rateLimit?.isLimited) {
      // Rate limit from Google API
      const resetIn = data.rateLimit?.resetIn || 60;
      const resetTime = Date.now() + resetIn * 1000;
      localStorage.setItem(STORAGE_KEYS.rateLimitReset, String(resetTime));
      startRateLimitTimer(resetIn * 1000);
      setRateLimitCooldown(resetIn);

      const message =
        data.rateLimit?.message ||
        `⏳ Google API rate limit reached. Please wait ${Math.ceil(resetIn / 60)} minute(s) before trying again.`;

      toast.error(message, {
        duration: 8000,
        icon: "⏱️",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "I'm temporarily handling too many requests. Please try again in a few minutes.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } else if (errorCode === 'NOT_CONFIGURED') {
      // Service not configured
      toast.error("AI service is not configured. Please contact support.", {
        duration: 5000,
        icon: "⚠️",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "The AI service is currently unavailable. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } else if (errorCode === 'TIMEOUT') {
      // Request timeout
      toast.error("Response timeout. Please try again.", {
        duration: 5000,
        icon: "⏱️",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "The request took too long. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } else if (errorCode === 'INVALID_RESPONSE') {
      // Invalid response format
      toast.error("Invalid response format. Please try again.", {
        duration: 5000,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "I received an invalid response. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } else if (httpStatus >= 500) {
      // Server error
      toast.error("Server error. Please try again later.", {
        duration: 5000,
        icon: "⚠️",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "Server error. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } else if (httpStatus >= 400) {
      // Client error
      toast.error(errorMessage || "Invalid request. Please try again.", {
        duration: 5000,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "Sorry, there was an issue with your request.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } else {
      // Generic error
      toast.error(errorMessage || "Sorry, I encountered an error. Please try again.", {
        duration: 5000,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: "Sorry, I'm having trouble right now. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    }

    setError(errorMessage || "Failed to get response. Please try again.");
    setTypingMessage("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || isLoading || rateLimitCooldown > 0) return;

    setShowWelcome(false);

    const userMessage = {
      id: `${Date.now()}-user`,
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);
    setTypingMessage("");

    try {
      let token = null;

      if (isAuthenticated && auth.currentUser) {
        token = await getFirebaseToken();
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Build message history for context
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await axios.post(
        `${API_BASE_URL}/gemini/chat`,
        {
          message: trimmed,
          context: buildContext(),
          sessionId,
          history,
        },
        {
          headers,
          timeout: 30000,
        }
      );

      // Check if request was successful (status 200 with success: true)
      if (response.status === 200) {
        if (response.data?.success && response.data?.content) {
          setLastFallbackUsed(response.data.fallbackUsed || false);
          const messageId = `${Date.now()}-bot`;
          
          // Use typing animation for better UX
          await typeMessage(response.data.content, messageId);
        } else if (!response.data?.success) {
          // Handle error response (status 200 with success: false)
          handleAIError(response.data, response.status);
        } else {
          // Should not happen with proper backend, but handle gracefully
          setError("Failed to get response. Please try again.");
          setMessages((prev) => [
            ...prev,
            {
              id: `${Date.now()}-error`,
              text: "Sorry, I encountered an error. Please try again.",
              sender: "bot",
              timestamp: new Date(),
              isError: true,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("[Chatbot] Error:", err);
      handleAIError(err.response?.data, err.response?.status);

      // Handle network errors and timeouts
      if (err.code === 'ECONNABORTED') {
        // Timeout
        setError("Request timeout. Please try again.");
        toast.error("Request took too long. Please try again.", {
          duration: 5000,
          icon: "⏱️",
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            text: "The request took too long. Please try again.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
          },
        ]);
      } else if (!err.response) {
        // Network error (no response from server)
        setError("Network error. Please check your connection.");

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            text: "Connection lost. Please check your internet and try again.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
          },
        ]);
      }

      setTypingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 6, scale: 0.99 },
        transition: { duration: 0.16, ease: "easeOut" },
      };

  const itemMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.14, ease: "easeOut" },
      };

  return (
    <>
      <style>
        {`
          .chat-scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .chat-scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <button
        onClick={handleOpenChat}
        title="Open assistant"
        className={`fixed bottom-5 right-5 z-40 transition-opacity duration-150 ${
          isOpen ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
        }`}
      >
        <div className="flex h-13 w-13 items-center justify-center rounded-full border border-emerald-300/30 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/15 md:h-14 md:w-14">
          <HiOutlineSparkles className="text-xl md:text-2xl" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...panelMotion}
            className="fixed bottom-20 right-3 z-50 flex h-[540px] w-[22rem] max-w-[calc(100vw-0.75rem)] flex-col overflow-hidden rounded-[1.6rem] border border-emerald-100 bg-white shadow-2xl sm:bottom-24 sm:right-5 sm:h-[560px] sm:w-[23.5rem]"
          >
            <div className="flex items-center justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <GeminiMark />
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Gemini Assistant
                  </h3>
                  <p className="text-[11px] text-white/80">
                    Campus Lost &amp; Found
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Button */}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  title="Search messages"
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* History Button */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  title="Conversation history"
                  className={`rounded-xl p-2 transition ${showHistory ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                  aria-label="History"
                >
                  <FaHistory className="text-sm" />
                </button>

                {/* More Options */}
                {messages.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setExpandedOptions(expandedOptions === 'main' ? null : 'main')}
                      title="More options"
                      className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                      aria-label="More options"
                    >
                      <FaEllipsisV className="text-sm" />
                    </button>
                    
                    {expandedOptions === 'main' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            handleExportChat();
                            setExpandedOptions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                        >
                          <FaDownload className="text-xs" /> Export as Text
                        </button>
                        <button
                          onClick={() => {
                            handleExportJSON();
                            setExpandedOptions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                        >
                          <FaDownload className="text-xs" /> Export as JSON
                        </button>
                        <button
                          onClick={() => {
                            handleSaveConversation();
                            setExpandedOptions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                        >
                          <FaTrophy className="text-xs" /> Save to History
                        </button>
                        <button
                          onClick={() => {
                            handleUndo();
                            setExpandedOptions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition border-t border-slate-200"
                        >
                          <FaUndoAlt className="text-xs" /> Undo
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleCloseChat}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
              {showSearch && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-slate-200 px-4 py-2.5 bg-slate-50"
                >
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Found {getFilteredMessages().length} of {messages.length} messages
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-white via-white to-slate-50">
              {showWelcome && messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 ring-1 ring-emerald-200 shadow-lg"
                  >
                    <HiOutlineSparkles className="text-3xl text-emerald-600" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      Welcome
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 font-medium">
                      Get instant help with lost and found items. Ask about posting, searching, claiming, or reporting.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 flex w-full flex-col gap-3"
                  >
                    {suggestedPrompts.map((prompt, idx) => (
                      <motion.button
                        key={prompt}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="group rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-emerald-50/30 px-5 py-3.5 text-left text-sm font-medium text-slate-800 transition-all hover:border-emerald-300 hover:from-emerald-50 hover:shadow-md hover:shadow-emerald-100/50"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">→</span>
                          {prompt}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className="chat-scrollbar-hide flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {(searchQuery.trim() ? getFilteredMessages() : messages).map((msg) => (
                      <motion.div
                        key={msg.id}
                        {...itemMotion}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} group`}
                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="flex flex-col gap-1 max-w-[86%]">
                          <div className="flex items-end gap-2">
                            {/* Edit Mode */}
                            {editingId === msg.id ? (
                              <div className="w-full flex flex-col gap-2 bg-slate-50 rounded-2xl rounded-bl-md border border-slate-300 p-3.5">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditingText("");
                                    }}
                                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(msg.id)}
                                    className="px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={[
                                  "max-w-full rounded-2xl px-4 py-3 text-[13px] leading-6 sm:text-sm",
                                  msg.sender === "user"
                                    ? "rounded-br-md bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md"
                                    : msg.isError
                                    ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                                    : "rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 shadow-sm",
                                ].join(" ")}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <RichMessageRenderer 
                                      text={msg.text} 
                                      isUserMessage={msg.sender === "user"}
                                    />
                                  </div>
                                  {msg.fallbackUsed && !msg.isError && (
                                    <span
                                      className="inline-block ml-2 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
                                      title="Fallback AI used"
                                    >
                                      Fallback
                                    </span>
                                  )}
                                </div>
                                {msg.edited && (
                                  <p className={`text-[10px] opacity-70 mt-2 ${msg.sender === "user" ? "text-emerald-100" : "text-slate-500"}`}>
                                    ✏️ edited
                                  </p>
                                )}
                                <div
                                  title={formatFullDate(msg.timestamp)}
                                  className={`mt-2.5 block text-[10px] cursor-help font-medium ${
                                    msg.sender === "user" ? "text-emerald-100" : "text-slate-500"
                                  }`}
                                >
                                  {getDateFromTimestamp(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Message Actions Menu */}
                            {hoveredMessageId === msg.id && editingId !== msg.id && !msg.isError && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="relative">
                                  <button
                                    onClick={() => setExpandedOptions(expandedOptions === msg.id ? null : msg.id)}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 transition"
                                    title="Message options"
                                  >
                                    <FaEllipsisV className="text-xs text-slate-500" />
                                  </button>

                                  {expandedOptions === msg.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -4 }}
                                      className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-slate-200"
                                    >
                                      <button
                                        onClick={() => {
                                          handleCopyMessage(msg.text);
                                          setExpandedOptions(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                                      >
                                        <FaCopy className="text-xs" /> Copy
                                      </button>

                                      {msg.sender === "user" && (
                                        <button
                                          onClick={() => {
                                           handleStartEdit(msg);
                                            setExpandedOptions(null);
                                          }}
                                          className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                                        >
                                          <FaEdit className="text-xs" /> Edit
                                        </button>
                                      )}

                                      {msg.sender === "bot" && (
                                        <>
                                          <button
                                            onClick={() => {
                                              handleRateMessage(msg.id, 'up');
                                              setExpandedOptions(null);
                                            }}
                                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition ${
                                              messageRatings[msg.id] === 'up' 
                                                ? 'bg-green-50 text-green-700' 
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                          >
                                            <FaThumbsUp className="text-xs" /> Helpful
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleRateMessage(msg.id, 'down');
                                              setExpandedOptions(null);
                                            }}
                                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition ${
                                              messageRatings[msg.id] === 'down' 
                                                ? 'bg-red-50 text-red-700' 
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                          >
                                            <FaThumbsDown className="text-xs" /> Not helpful
                                          </button>
                                        </>
                                      )}

                                      <button
                                        onClick={() => {
                                          handleDeleteMessage(msg.id);
                                          setExpandedOptions(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition border-t border-slate-200"
                                      >
                                        <FaTrash className="text-xs" /> Delete
                                      </button>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Delete Confirmation */}
                            {showDeleteConfirm === msg.id && (
                              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  onClick={handleCancelDelete}
                                  className="px-2 py-1 text-xs bg-slate-300 text-slate-700 rounded hover:bg-slate-400 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && typingMessage === "" && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                          <span className="ml-1 font-medium">Generating response</span>
                        </div>
                      </motion.div>
                    )}

                    {typingMessage && (
                      <motion.div
                        {...itemMotion}
                        className="flex justify-start"
                      >
                        <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3 text-[13px] leading-6 text-slate-900 sm:text-sm shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <RichMessageRenderer 
                                text={typingMessage}
                                isUserMessage={false}
                              />
                            </div>
                            {lastFallbackUsed && (
                              <span
                                className="inline-block ml-2 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md whitespace-nowrap flex-shrink-0"
                                title="Fallback AI used"
                              >
                                Fallback
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

            {/* Conversation History Modal */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 rounded-[1.6rem] flex items-center justify-center z-[60] backdrop-blur-sm"
                  onClick={() => setShowHistory(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-br from-white to-slate-50 rounded-2xl m-4 max-h-96 w-full max-w-sm flex flex-col overflow-hidden shadow-2xl border border-slate-200"
                  >
                    <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-slate-50">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Conversation History</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{conversations.length} saved</p>
                      </div>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition"
                      >
                        <FaTimes className="text-sm text-slate-600" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="text-4xl mb-2">📁</div>
                          <p className="text-sm text-slate-500 font-medium">No saved conversations yet</p>
                          <p className="text-xs text-slate-400 mt-1">Save conversations to access them later</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {conversations.map((conv) => (
                            <motion.div
                              key={conv.id}
                              whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.02)' }}
                              className="p-4 hover:bg-slate-50 transition cursor-pointer group border-l-4 border-l-transparent hover:border-l-emerald-500"
                            >
                              <button
                                onClick={() => handleLoadConversation(conv)}
                                className="w-full text-left"
                              >
                                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition">
                                  {conv.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                                  <FaClock className="text-xs" />
                                  {conv.messageCount} messages
                                </p>
                              </button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conv.id);
                                }}
                                className="mt-3 text-xs text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 font-medium hover:bg-red-50 px-2 py-1 rounded"
                              >
                                <FaTrash className="text-xs" /> Remove
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 backdrop-blur-sm"
            >
              <div className="space-y-3">
                <div className="flex items-end gap-3">
                  <div className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200 focus-within:shadow-md transition-all">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type your message... (Shift+Enter for new line)"
                      disabled={isLoading || rateLimitCooldown > 0}
                      rows={1}
                      className="max-h-28 min-h-[24px] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed font-medium"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !inputValue.trim() || rateLimitCooldown > 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white transition-all shadow-lg hover:shadow-emerald-500/40 disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none"
                    aria-label="Send message"
                  >
                    <FaArrowUp className="text-sm" />
                  </motion.button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2"
                  >
                    <FaTimesCircle className="text-sm" /> {error}
                  </motion.div>
                )}

                {rateLimitCooldown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium flex items-center gap-2"
                  >
                    <FaClock className="text-sm animate-spin" /> Please wait {rateLimitCooldown}s before sending again
                  </motion.div>
                )}

                {messages.length > 0 && !showWelcome && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="text-xs text-slate-500 hover:text-slate-700 transition font-medium hover:underline"
                  >
                    ✕ Clear chat
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiChatbot;