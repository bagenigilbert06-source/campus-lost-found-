import React from 'react';
import { FaUser, FaUserShield } from 'react-icons/fa';

const MessageBubble = ({
  message,
  isCurrentUser,
  showRole = true,
  className = ''
}) => {
  const isAdmin = message.senderRole === 'admin';
  const isUser = message.senderRole === 'student';

  // Determine alignment and styling based on sender role
  const bubbleAlignment = isAdmin ? 'justify-start' : 'justify-end';
  const bubbleColors = isAdmin
    ? 'bg-blue-50 border-blue-200 text-blue-900'
    : 'bg-emerald-50 border-emerald-200 text-emerald-900';
  const roleIcon = isAdmin ? FaUserShield : FaUser;
  const roleColor = isAdmin ? 'text-blue-600' : 'text-emerald-600';
  const roleLabel = isAdmin ? 'Admin' : 'Student';

  return (
    <div className={`flex ${bubbleAlignment} mb-4 ${className}`}>
      <div className={`max-w-[70%] ${isAdmin ? 'mr-auto' : 'ml-auto'}`}>
        {/* Role indicator for admin messages */}
        {showRole && isAdmin && (
          <div className="flex items-center gap-2 mb-1">
            <roleIcon className={`text-sm ${roleColor}`} />
            <span className={`text-xs font-medium ${roleColor}`}>{roleLabel}</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`
          relative px-4 py-3 rounded-2xl border shadow-sm
          ${bubbleColors}
          ${isAdmin ? 'rounded-tl-sm' : 'rounded-tr-sm'}
        `}>
          {/* Message content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Timestamp */}
          <div className={`
            text-xs mt-2 opacity-70
            ${isAdmin ? 'text-left' : 'text-right'}
          `}>
            {new Date(message.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
            {message.isRead && !isCurrentUser && (
              <span className="ml-1 text-xs">✓</span>
            )}
          </div>
        </div>

        {/* Role indicator for user messages */}
        {showRole && isUser && (
          <div className="flex items-center justify-end gap-2 mt-1">
            <span className={`text-xs font-medium ${roleColor}`}>{roleLabel}</span>
            <roleIcon className={`text-sm ${roleColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;