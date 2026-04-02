import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  memo,
} from "react";
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
  FaUndoAlt,
  FaEllipsisV,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaComments,
  FaRedo,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import axios from "axios";
import toast from "react-hot-toast";
import { getIdToken } from "firebase/auth";
import auth from "../firebase/firebase.init.js";
import AuthContext from "../context/Authcontext/AuthContext";

const suggestedPrompts = [
  "How do I post a lost item?",
  "How can I report found items?",
  "What's the claiming process?",
  "How do I search for items?",
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "";

const STORAGE_KEYS = {
  messages: "gemini_chat_messages",
  sessionId: "gemini_chat_session",
  rateLimitReset: "gemini_rate_limit_reset",
  conversations: "gemini_chat_conversations",
  messageRatings: "gemini_message_ratings",
};

const CHAT_WIDTH = "w-[calc(100vw-1rem)] sm:w-[420px] md:w-[460px]";
const CHAT_HEIGHT =
  "h-[min(82dvh,720px)] sm:h-[min(78dvh,720px)]";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (!value) return new Date();
  return new Date(value);
}

function formatTime(timestamp) {
  return toDate(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(timestamp) {
  return toDate(timestamp).toLocaleString();
}

function serializeMessages(messages) {
  return messages.map((message) => ({
    ...message,
    timestamp: toDate(message.timestamp).toISOString(),
    editedAt: message.editedAt ? toDate(message.editedAt).toISOString() : null,
  }));
}

function deserializeMessages(messages = []) {
  return messages.map((message) => ({
    ...message,
    timestamp: toDate(message.timestamp),
    editedAt: message.editedAt ? toDate(message.editedAt) : null,
  }));
}

function serializeConversations(conversations) {
  return conversations.map((conversation) => ({
    ...conversation,
    createdAt: toDate(conversation.createdAt).toISOString(),
    messages: serializeMessages(conversation.messages || []),
  }));
}

function deserializeConversations(conversations = []) {
  return conversations.map((conversation) => ({
    ...conversation,
    createdAt: toDate(conversation.createdAt),
    messages: deserializeMessages(conversation.messages || []),
  }));
}

function useDebouncedEffect(effect, deps, delay = 250) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      effect();
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

const GeminiMark = memo(function GeminiMark({ className = "" }) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
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

const RichMessageRenderer = memo(function RichMessageRenderer({
  text,
  isUserMessage,
}) {
  const sections = useMemo(
    () => String(text || "").split("\n\n").filter((section) => section.trim()),
    [text]
  );

  if (isUserMessage) {
    return (
      <p className="whitespace-pre-wrap break-words leading-relaxed text-[14px] sm:text-sm">
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        const trimmed = section.trim();

        if (/^\d+\.\s/m.test(trimmed) && trimmed.split("\n").length > 1) {
          const items = trimmed.split("\n").filter(Boolean);
          return (
            <ol
              key={idx}
              className="list-decimal space-y-2 pl-5 text-[14px] leading-6 text-slate-800"
            >
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace(/^\d+\.\s*/, "")}</li>
              ))}
            </ol>
          );
        }

        if (/^[-•*]\s/m.test(trimmed) && trimmed.split("\n").length > 1) {
          const items = trimmed.split("\n").filter(Boolean);
          return (
            <ul
              key={idx}
              className="list-disc space-y-2 pl-5 text-[14px] leading-6 text-slate-800"
            >
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace(/^[-•*]\s*/, "")}</li>
              ))}
            </ul>
          );
        }

        const codeMatch = trimmed.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeMatch) {
          return (
            <pre
              key={idx}
              className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100"
            >
              <code>{codeMatch[2].trim()}</code>
            </pre>
          );
        }

        if (trimmed.startsWith("#")) {
          const level = Math.min(trimmed.match(/^#+/)[0].length, 3);
          const content = trimmed.replace(/^#+\s*/, "");
          const classes = {
            1: "text-base font-semibold text-slate-900",
            2: "text-[15px] font-semibold text-slate-900",
            3: "text-sm font-semibold text-slate-900",
          };
          return (
            <h3 key={idx} className={classes[level]}>
              {content}
            </h3>
          );
        }

        return (
          <p
            key={idx}
            className="whitespace-pre-wrap break-words text-[14px] leading-6 text-slate-800"
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
});

const WelcomeView = memo(function WelcomeView({ onSuggestionClick }) {
  return (
    <div className="flex h-full flex-col justify-center px-4 py-6 sm:px-6">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-sm">
        <HiOutlineSparkles className="text-2xl text-white" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Ask the assistant anything
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Fast, clean, and responsive chat for your lost and found platform.
        </p>
      </div>

      <div className="mt-6 grid gap-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSuggestionClick(prompt)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
});

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
});

const MessageActions = memo(function MessageActions({
  message,
  expanded,
  rating,
  onToggleMenu,
  onCopy,
  onStartEdit,
  onRate,
  onDelete,
}) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => onToggleMenu(message.id)}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Message options"
      >
        <FaEllipsisV className="text-xs" />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <button
              type="button"
              onClick={() => onCopy(message)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              <FaCopy className="text-[11px]" />
              Copy
            </button>

            {message.sender === "user" && !message.isError && (
              <button
                type="button"
                onClick={() => onStartEdit(message)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"
              >
                <FaEdit className="text-[11px]" />
                Edit
              </button>
            )}

            {message.sender === "bot" && !message.isError && (
              <>
                <button
                  type="button"
                  onClick={() => onRate(message.id, "up")}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-slate-50",
                    rating === "up" ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
                  )}
                >
                  <FaThumbsUp className="text-[11px]" />
                  Helpful
                </button>
                <button
                  type="button"
                  onClick={() => onRate(message.id, "down")}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-slate-50",
                    rating === "down" ? "bg-rose-50 text-rose-700" : "text-slate-700"
                  )}
                >
                  <FaThumbsDown className="text-[11px]" />
                  Not helpful
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => onDelete(message.id)}
              className="flex w-full items-center gap-2 border-t border-slate-200 px-3 py-2.5 text-left text-xs text-rose-600 hover:bg-rose-50"
            >
              <FaTrash className="text-[11px]" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const MessageRow = memo(function MessageRow({
  message,
  isEditing,
  editingText,
  setEditingText,
  onSaveEdit,
  onCancelEdit,
  expandedOptions,
  messageRatings,
  showDeleteConfirm,
  onToggleMenu,
  onCopy,
  onStartEdit,
  onRate,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  onRetry,
}) {
  const isUser = message.sender === "user";

  return (
    <div className={cn("group flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[92%] items-end gap-2 sm:max-w-[86%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {!isUser && (
          <div className="mb-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white sm:flex">
            <HiOutlineSparkles className="text-sm" />
          </div>
        )}

        <div className="min-w-0">
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 shadow-sm",
              isUser
                ? "rounded-br-md border-emerald-700 bg-emerald-700 text-white"
                : message.isError
                ? "rounded-bl-md border-rose-200 bg-rose-50 text-rose-900"
                : "rounded-bl-md border-slate-200 bg-white text-slate-900"
            )}
          >
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="min-h-[90px] w-full resize-none rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSaveEdit(message.id)}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <RichMessageRenderer text={message.text} isUserMessage={isUser} />
                {message.fallbackUsed && !message.isError && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    <FaCheckCircle className="text-[10px]" />
                    Fallback response
                  </div>
                )}
              </>
            )}
          </div>

          <div
            className={cn(
              "mt-1.5 flex items-center gap-2 px-1 text-[11px] text-slate-400",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <span title={formatFullDate(message.timestamp)}>
              {formatTime(message.timestamp)}
            </span>
            {message.edited && <span>edited</span>}
            {message.isError && (
              <span className="inline-flex items-center gap-1 text-rose-500">
                <FaTimesCircle className="text-[10px]" />
                failed
              </span>
            )}
          </div>

          {showDeleteConfirm === message.id && (
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2">
              <button
                type="button"
                onClick={() => onConfirmDelete(message.id)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
              >
                Cancel
              </button>
            </div>
          )}

          {message.isError && message.canRetry && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => onRetry(message.retryText || message.text)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <FaRedo className="text-[10px]" />
                Retry
              </button>
            </div>
          )}
        </div>

        {!isEditing && (
          <MessageActions
            message={message}
            expanded={expandedOptions === message.id}
            rating={messageRatings[message.id]}
            onToggleMenu={onToggleMenu}
            onCopy={onCopy}
            onStartEdit={onStartEdit}
            onRate={onRate}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
});

const MessageList = memo(function MessageList(props) {
  const {
    messages,
    isLoading,
    messageEndRef,
    containerRef,
    onScroll,
  } = props;

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4"
      style={{ overscrollBehavior: "contain" }}
    >
      {messages.map((message) => (
        <MessageRow key={message.id} {...props} message={message} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={messageEndRef} />
    </div>
  );
});

const HistoryDrawer = memo(function HistoryDrawer({
  open,
  conversations,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
  onClose,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-20 bg-slate-950/30"
            aria-label="Close history"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.18 }}
            className="absolute inset-y-0 right-0 z-30 w-[88%] max-w-[320px] border-l border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">History</h3>
                <p className="text-xs text-slate-500">
                  Saved conversations
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="h-[calc(100%-61px)] overflow-y-auto p-3">
              {conversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No saved conversations yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "rounded-2xl border p-3",
                        currentConversationId === conversation.id
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onLoadConversation(conversation)}
                        className="w-full text-left"
                      >
                        <div className="line-clamp-2 text-sm font-medium text-slate-800">
                          {conversation.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {conversation.messageCount || conversation.messages?.length || 0} messages
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {formatFullDate(conversation.createdAt)}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteConversation(conversation.id)}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <FaTrash className="text-[10px]" />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

const ChatHeader = memo(function ChatHeader({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  filteredCount,
  messageCount,
  onToggleHistory,
  onSaveConversation,
  onExportText,
  onExportJSON,
  onClose,
}) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-900 px-3 py-3 text-white sm:px-4">
      <div className="flex items-center gap-3">
        <GeminiMark />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">AI Assistant</div>
          <div className="text-xs text-white/70">
            {messageCount > 0 ? `${messageCount} messages` : "Ready to help"}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Search messages"
          >
            <FaSearch className="text-sm" />
          </button>
          <button
            type="button"
            onClick={onToggleHistory}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Conversation history"
          >
            <FaHistory className="text-sm" />
          </button>
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={onSaveConversation}
              className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Save conversation"
            >
              <FaComments className="text-sm" />
            </button>
            <button
              type="button"
              onClick={onExportText}
              className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Export text"
            >
              <FaDownload className="text-sm" />
            </button>
            <button
              type="button"
              onClick={onExportJSON}
              className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Export JSON"
            >
              <FaClock className="text-sm" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="mt-3"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10">
              <FaSearch className="text-xs text-white/70" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search messages"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/55 outline-none"
              />
              <span className="shrink-0 text-[11px] text-white/65">
                {filteredCount}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const ChatComposer = memo(function ChatComposer({
  inputValue,
  setInputValue,
  onSubmit,
  onClearChat,
  isLoading,
  rateLimitCooldown,
  error,
  textareaRef,
}) {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [inputValue, textareaRef]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSubmit(event);
      }
    },
    [onSubmit]
  );

  return (
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Type your message..."
            className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || rateLimitCooldown > 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            <FaArrowUp className="text-sm" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <FaTimesCircle className="text-sm" />
            {error}
          </div>
        )}

        {rateLimitCooldown > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <FaClock className="text-sm" />
            Please wait {rateLimitCooldown}s before sending again.
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClearChat}
            className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
          >
            Clear chat
          </button>
          <div className="text-[11px] text-slate-400">
            Enter to send • Shift+Enter for new line
          </div>
        </div>
      </form>
    </div>
  );
});

const GeminiChatbot = ({ isAuthenticated = false, context = "" }) => {
  const { user } = useContext(AuthContext);
  const reduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messageRatings, setMessageRatings] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFallbackUsed, setLastFallbackUsed] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [undoStack, setUndoStack] = useState([]);

  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const rateLimitTimerRef = useRef(null);

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) =>
      String(message.text || "").toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  const buildContext = useCallback(() => {
    if (isAuthenticated && user) {
      return `User is authenticated. ${context || ""}`.trim();
    }
    return `User is browsing public pages. ${context || ""}`.trim();
  }, [context, isAuthenticated, user]);

  const getFirebaseToken = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await getIdToken(currentUser);
      }
    } catch (tokenError) {
      console.error("Error getting Firebase token:", tokenError);
    }
    return null;
  }, []);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearRateLimitTimer = useCallback(() => {
    if (rateLimitTimerRef.current) {
      clearInterval(rateLimitTimerRef.current);
      rateLimitTimerRef.current = null;
    }
  }, []);

  const startRateLimitTimer = useCallback(
    (milliseconds) => {
      clearRateLimitTimer();

      const endTime = Date.now() + milliseconds;
      rateLimitTimerRef.current = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          clearRateLimitTimer();
          setRateLimitCooldown(0);
          localStorage.removeItem(STORAGE_KEYS.rateLimitReset);
          return;
        }
        setRateLimitCooldown(Math.ceil(remaining / 1000));
      }, 1000);
    },
    [clearRateLimitTimer]
  );

  const handleAIError = useCallback(
    (data, httpStatus, originalUserText = "") => {
      const errorCode = data?.code;
      const errorMessage = data?.error || data?.message || "Failed to get response.";

      if (errorCode === "RATE_LIMIT" || data?.rateLimit?.isLimited) {
        const resetIn = data?.rateLimit?.resetIn || 60;
        const resetTime = Date.now() + resetIn * 1000;

        localStorage.setItem(STORAGE_KEYS.rateLimitReset, String(resetTime));
        setRateLimitCooldown(resetIn);
        startRateLimitTimer(resetIn * 1000);

        toast.error(
          data?.rateLimit?.message ||
            `Rate limit reached. Please wait ${Math.ceil(resetIn / 60)} minute(s).`,
          { duration: 6000 }
        );

        appendMessage({
          id: makeId("bot-error"),
          text: "I'm temporarily handling too many requests. Please try again in a moment.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          canRetry: true,
          retryText: originalUserText,
        });
      } else if (errorCode === "NOT_CONFIGURED") {
        toast.error("AI service is not configured.", { duration: 5000 });
        appendMessage({
          id: makeId("bot-error"),
          text: "The AI service is currently unavailable. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          canRetry: true,
          retryText: originalUserText,
        });
      } else if (errorCode === "TIMEOUT" || httpStatus === 408) {
        toast.error("Response timeout. Please try again.", { duration: 5000 });
        appendMessage({
          id: makeId("bot-error"),
          text: "The request took too long. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          canRetry: true,
          retryText: originalUserText,
        });
      } else if (httpStatus >= 500) {
        toast.error("Server error. Please try again later.", { duration: 5000 });
        appendMessage({
          id: makeId("bot-error"),
          text: "Server error. Please try again later.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          canRetry: true,
          retryText: originalUserText,
        });
      } else if (httpStatus >= 400) {
        toast.error(errorMessage, { duration: 5000 });
        appendMessage({
          id: makeId("bot-error"),
          text: "Sorry, there was an issue with your request.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          canRetry: true,
          retryText: originalUserText,
        });
      } else {
        toast.error(errorMessage, { duration: 5000 });
        appendMessage({
          id: makeId("bot-error"),
          text: "Sorry, I'm having trouble right now. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          canRetry: true,
          retryText: originalUserText,
        });
      }

      setError(errorMessage);
    },
    [appendMessage, startRateLimitTimer]
  );

  const scrollToBottom = useCallback(
    (behavior = "smooth") => {
      if (!autoScrollEnabled) return;
      messageEndRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : behavior,
        block: "end",
      });
    },
    [autoScrollEnabled, reduceMotion]
  );

  const handleMessageScroll = useCallback((event) => {
    const target = event.currentTarget;
    const nearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 80;
    setAutoScrollEnabled(nearBottom);
  }, []);

  useEffect(() => {
    const rawMessages = localStorage.getItem(STORAGE_KEYS.messages);
    const rawSessionId = localStorage.getItem(STORAGE_KEYS.sessionId);
    const rawReset = localStorage.getItem(STORAGE_KEYS.rateLimitReset);
    const rawConversations = localStorage.getItem(STORAGE_KEYS.conversations);
    const rawRatings = localStorage.getItem(STORAGE_KEYS.messageRatings);

    const parsedMessages = deserializeMessages(safeParse(rawMessages, []));
    const parsedConversations = deserializeConversations(
      safeParse(rawConversations, [])
    );
    const parsedRatings = safeParse(rawRatings, {});

    setMessages(parsedMessages);
    setConversations(parsedConversations);
    setMessageRatings(parsedRatings);
    setShowWelcome(parsedMessages.length === 0);

    const createdSessionId = rawSessionId || makeId("session");
    setSessionId(createdSessionId);
    setCurrentConversationId(createdSessionId);
    localStorage.setItem(STORAGE_KEYS.sessionId, createdSessionId);

    if (rawReset) {
      const resetTime = Number(rawReset);
      const remaining = resetTime - Date.now();
      if (remaining > 0) {
        setRateLimitCooldown(Math.ceil(remaining / 1000));
        startRateLimitTimer(remaining);
      } else {
        localStorage.removeItem(STORAGE_KEYS.rateLimitReset);
      }
    }

    return () => clearRateLimitTimer();
  }, [clearRateLimitTimer, startRateLimitTimer]);

  useDebouncedEffect(() => {
    if (messages.length === 0) {
      localStorage.removeItem(STORAGE_KEYS.messages);
      return;
    }
    localStorage.setItem(
      STORAGE_KEYS.messages,
      JSON.stringify(serializeMessages(messages))
    );
  }, [messages], 300);

  useDebouncedEffect(() => {
    if (conversations.length === 0) {
      localStorage.removeItem(STORAGE_KEYS.conversations);
      return;
    }
    localStorage.setItem(
      STORAGE_KEYS.conversations,
      JSON.stringify(serializeConversations(conversations))
    );
  }, [conversations], 350);

  useDebouncedEffect(() => {
    if (Object.keys(messageRatings).length === 0) {
      localStorage.removeItem(STORAGE_KEYS.messageRatings);
      return;
    }
    localStorage.setItem(
      STORAGE_KEYS.messageRatings,
      JSON.stringify(messageRatings)
    );
  }, [messageRatings], 250);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => scrollToBottom("smooth"));
  }, [messages.length, isLoading, isOpen, scrollToBottom]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const menuRoot = event.target.closest?.("[data-message-menu]");
      if (!menuRoot) {
        setExpandedOptions(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    setError(null);
    if (messages.length === 0) {
      setShowWelcome(true);
    }
  }, [messages.length]);

  const handleCloseChat = useCallback(() => {
    setIsOpen(false);
    setShowHistory(false);
    setExpandedOptions(null);
    setShowDeleteConfirm(null);
    setEditingId(null);
    setError(null);
  }, []);

  const handleSuggestionClick = useCallback((prompt) => {
    setShowWelcome(false);
    setInputValue(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setUndoStack([]);
    setShowWelcome(true);
    setError(null);
    setExpandedOptions(null);
    setShowDeleteConfirm(null);
    localStorage.removeItem(STORAGE_KEYS.messages);
    toast.success("Chat cleared");
  }, []);

  const handleCopyMessage = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(message.text);
      toast.success("Message copied");
      setExpandedOptions(null);
    } catch {
      toast.error("Could not copy message");
    }
  }, []);

  const handleStartEdit = useCallback((message) => {
    setEditingId(message.id);
    setEditingText(message.text);
    setExpandedOptions(null);
  }, []);

  const handleSaveEdit = useCallback(
    (messageId) => {
      const value = editingText.trim();
      if (!value) {
        toast.error("Message cannot be empty");
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                text: value,
                edited: true,
                editedAt: new Date(),
              }
            : message
        )
      );

      setEditingId(null);
      setEditingText("");
      toast.success("Message updated");
    },
    [editingText]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingText("");
  }, []);

  const handleRateMessage = useCallback((messageId, rating) => {
    setMessageRatings((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === rating ? null : rating,
    }));
    setExpandedOptions(null);
  }, []);

  const handleDeleteMessage = useCallback((messageId) => {
    setShowDeleteConfirm((prev) => (prev === messageId ? null : messageId));
    setExpandedOptions(null);
  }, []);

  const handleConfirmDelete = useCallback((messageId) => {
    setMessages((prev) => {
      const deleted = prev.find((message) => message.id === messageId);
      if (deleted) {
        setUndoStack((stack) => [...stack.slice(-19), deleted]);
      }
      return prev.filter((message) => message.id !== messageId);
    });
    setShowDeleteConfirm(null);
    toast.success("Message deleted");
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(null);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) {
        toast.error("Nothing to undo");
        return prev;
      }
      const restored = prev[prev.length - 1];
      setMessages((messagesPrev) => [...messagesPrev, restored]);
      toast.success("Message restored");
      return prev.slice(0, -1);
    });
  }, []);

  const handleSaveConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error("No messages to save");
      return;
    }

    const title =
      messages.find((message) => message.sender === "user")?.text?.slice(0, 60) ||
      "New conversation";

    const newConversation = {
      id: makeId("conversation"),
      title,
      messages,
      createdAt: new Date(),
      messageCount: messages.length,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    toast.success("Conversation saved");
  }, [messages]);

  const handleLoadConversation = useCallback((conversation) => {
    setMessages(deserializeMessages(conversation.messages || []));
    setCurrentConversationId(conversation.id);
    setShowHistory(false);
    setShowWelcome(false);
    setError(null);
    toast.success("Conversation loaded");
  }, []);

  const handleDeleteConversation = useCallback(
    (conversationId) => {
      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== conversationId)
      );

      if (currentConversationId === conversationId) {
        setCurrentConversationId(sessionId);
        setMessages([]);
        setShowWelcome(true);
      }

      toast.success("Conversation deleted");
    },
    [currentConversationId, sessionId]
  );

  const handleExportChat = useCallback(() => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const text = messages
      .map((message) => {
        const sender = message.sender === "user" ? "You" : "Assistant";
        return `[${formatFullDate(message.timestamp)}] ${sender}: ${message.text}`;
      })
      .join("\n\n");

    const anchor = document.createElement("a");
    anchor.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
    anchor.download = `chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success("Chat exported");
  }, [messages]);

  const handleExportJSON = useCallback(() => {
    if (messages.length === 0) {
      toast.error("No messages to export");
      return;
    }

    const data = {
      exportDate: new Date().toISOString(),
      messagesCount: messages.length,
      messages: serializeMessages(messages),
    };

    const anchor = document.createElement("a");
    anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    anchor.download = `chat-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    toast.success("JSON exported");
  }, [messages]);

  const sendPrompt = useCallback(
    async (promptText) => {
      const trimmed = promptText.trim();
      if (!trimmed || isLoading || rateLimitCooldown > 0) return;

      const userMessage = {
        id: makeId("user"),
        text: trimmed,
        sender: "user",
        timestamp: new Date(),
      };

      setShowWelcome(false);
      setExpandedOptions(null);
      setShowDeleteConfirm(null);
      setInputValue("");
      setIsLoading(true);
      setError(null);
      appendMessage(userMessage);

      try {
        let token = null;
        if (isAuthenticated && auth.currentUser) {
          token = await getFirebaseToken();
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const history = [...messages, userMessage].map((message) => ({
          role: message.sender === "user" ? "user" : "assistant",
          content: message.text,
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

        if (response.status === 200 && response.data?.success && response.data?.content) {
          setLastFallbackUsed(Boolean(response.data?.fallbackUsed));
          appendMessage({
            id: makeId("bot"),
            text: response.data.content,
            sender: "bot",
            timestamp: new Date(),
            fallbackUsed: Boolean(response.data?.fallbackUsed),
          });
          return;
        }

        handleAIError(response.data, response.status, trimmed);
      } catch (requestError) {
        console.error("[Chatbot] Error:", requestError);

        if (requestError.code === "ECONNABORTED") {
          handleAIError(
            { code: "TIMEOUT", message: "Request timeout. Please try again." },
            408,
            trimmed
          );
        } else if (!requestError.response) {
          setError("Network error. Please check your connection.");
          toast.error("Network error. Please check your connection.");
          appendMessage({
            id: makeId("bot-error"),
            text: "I couldn't reach the server. Please check your connection and try again.",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
            canRetry: true,
            retryText: trimmed,
          });
        } else {
          handleAIError(
            requestError.response?.data,
            requestError.response?.status,
            trimmed
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      API_BASE_URL,
      appendMessage,
      buildContext,
      getFirebaseToken,
      handleAIError,
      isAuthenticated,
      isLoading,
      messages,
      rateLimitCooldown,
      sessionId,
    ]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      await sendPrompt(inputValue);
    },
    [inputValue, sendPrompt]
  );

  const handleRetry = useCallback(
    async (text) => {
      await sendPrompt(text);
    },
    [sendPrompt]
  );

  const toggleMenu = useCallback((messageId) => {
    setExpandedOptions((prev) => (prev === messageId ? null : messageId));
  }, []);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenChat}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 sm:bottom-6 sm:right-6"
          aria-label="Open AI chat"
        >
          <HiOutlineSparkles className="text-2xl" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className={cn(
              "fixed bottom-2 right-2 z-50 flex max-h-[90dvh] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl sm:bottom-6 sm:right-6",
              CHAT_WIDTH,
              CHAT_HEIGHT
            )}
          >
            <ChatHeader
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredCount={filteredMessages.length}
              messageCount={messages.length}
              onToggleHistory={() => setShowHistory((prev) => !prev)}
              onSaveConversation={handleSaveConversation}
              onExportText={handleExportChat}
              onExportJSON={handleExportJSON}
              onClose={handleCloseChat}
            />

            <div className="relative flex min-h-0 flex-1 bg-slate-50">
              {showWelcome && messages.length === 0 ? (
                <WelcomeView onSuggestionClick={handleSuggestionClick} />
              ) : (
                <MessageList
                  messages={filteredMessages}
                  isLoading={isLoading}
                  messageEndRef={messageEndRef}
                  containerRef={messageContainerRef}
                  onScroll={handleMessageScroll}
                  isEditing={false}
                  editingId={editingId}
                  editingText={editingText}
                  setEditingText={setEditingText}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  expandedOptions={expandedOptions}
                  messageRatings={messageRatings}
                  showDeleteConfirm={showDeleteConfirm}
                  onToggleMenu={toggleMenu}
                  onCopy={handleCopyMessage}
                  onStartEdit={handleStartEdit}
                  onRate={handleRateMessage}
                  onDelete={handleDeleteMessage}
                  onConfirmDelete={handleConfirmDelete}
                  onCancelDelete={handleCancelDelete}
                  onRetry={handleRetry}
                />
              )}

              <HistoryDrawer
                open={showHistory}
                conversations={conversations}
                currentConversationId={currentConversationId}
                onLoadConversation={handleLoadConversation}
                onDeleteConversation={handleDeleteConversation}
                onClose={() => setShowHistory(false)}
              />
            </div>

            <div className="border-t border-slate-100 bg-white px-3 py-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {lastFallbackUsed ? "Last answer used fallback" : "Assistant ready"}
                </span>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-100 hover:text-slate-600"
                >
                  <FaUndoAlt className="text-[10px]" />
                  Undo delete
                </button>
              </div>
            </div>

            <ChatComposer
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSubmit={handleSubmit}
              onClearChat={handleClearChat}
              isLoading={isLoading}
              rateLimitCooldown={rateLimitCooldown}
              error={error}
              textareaRef={textareaRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GeminiChatbot;