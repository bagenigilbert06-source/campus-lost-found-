import React, { useState, useRef, useEffect, useContext, useCallback, memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaTimes, FaArrowUp } from "react-icons/fa";
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

const suggestedPrompts = [
  "How do I post a lost item?",
  "How can I report found items?",
  "What's the claiming process?",
  "How do I search for items?",
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const GeminiChatbot = ({ isAuthenticated = false, context = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { user } = useContext(AuthContext);
  const reduceMotion = useReducedMotion();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [reduceMotion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

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

    try {
      let token = null;

      if (isAuthenticated && auth.currentUser) {
        token = await getFirebaseToken();
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${API_BASE_URL}/api/gemini/chat`,
        {
          message: trimmed,
          context: buildContext(),
        },
        {
          headers,
          timeout: 30000,
        }
      );

      if (response.data?.success && response.data?.content) {
        const botMessage = {
          id: `${Date.now()}-bot`,
          text: response.data.content,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else if (response.data?.rateLimit?.isLimited) {
        const rl = response.data.rateLimit;
        const message =
          rl.message ||
          `⏳ Google API Rate Limit Reached. Please try again at ${rl.resetTime || 'next available window'} (in ${Math.ceil((rl.resetIn || 60)/60)}m). Upgrade to Gemini Pro for higher usage.`;

        toast.error(message, {
          duration: 8000,
          icon: "⏱️",
        });
        setError(null); // Don't show chat error bubble for rate limit
      } else {
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
    } catch (err) {
      console.error("[Chatbot] Error:", err);
      
      // Check if it's a rate limit error from response data
      if (err.response?.data?.rateLimit?.isLimited) {
        const rl = err.response.data.rateLimit;
        const message =
          rl.message ||
          `⏳ Google API Rate Limit Reached. Please try again at ${rl.resetTime || 'next available window'} (in ${Math.ceil((rl.resetIn || 60)/60)}m). Upgrade to Gemini Pro for higher usage.`;

        toast.error(message, {
          duration: 8000,
          icon: "⏱️",
        });
        setError(null);
      } else {
        setError("Connection error. Please check your internet and try again.");

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            text: "Sorry, I'm having trouble connecting right now. Please try again later.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
          },
        ]);
      }
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

              <button
                onClick={handleCloseChat}
                className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col bg-white">
              {showWelcome && messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                    <HiOutlineSparkles className="text-2xl text-emerald-600" />
                  </div>

                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Hello
                  </h2>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                    Ask about posting, searching, claiming, or reporting lost and found items.
                  </p>

                  <div className="mt-5 flex w-full flex-col gap-2.5">
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestionClick(prompt)}
                        className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chat-scrollbar-hide flex-1 overflow-y-auto px-3 py-4 sm:px-4">
                  <div className="space-y-3.5">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        {...itemMotion}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={[
                            "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-6 sm:text-sm",
                            msg.sender === "user"
                              ? "rounded-br-md bg-emerald-600 text-white"
                              : msg.isError
                              ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                              : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-900",
                          ].join(" ")}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          <span
                            className={`mt-1 block text-[10px] ${
                              msg.sender === "user" ? "text-emerald-100" : "text-slate-500"
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                          Searching
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-200 bg-white p-3"
            >
              <div className="flex items-end gap-2.5">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
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
                    placeholder="Message assistant..."
                    disabled={isLoading}
                    rows={1}
                    className="max-h-24 min-h-[22px] w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                  aria-label="Send message"
                >
                  <FaArrowUp className="text-xs" />
                </button>
              </div>

              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiChatbot;