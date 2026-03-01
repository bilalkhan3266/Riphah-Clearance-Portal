import React from 'react';
import { MdReply } from 'react-icons/md';

export default function MessageCard({
  message,
  isSelected = false,
  onClick,
  onReply
}) {
  return (
    <div 
      className={`message-item ${isSelected ? 'selected' : ''} ${message.isUnread ? 'unread' : ''}`}
      onClick={onClick}
    >
      <div className="message-item-header">
        <span className="message-item-sender">{message.sender || 'System'}</span>
        <span className="message-item-time">
          {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="message-item-subject">{message.subject || '(No subject)'}</div>
      <div className="message-item-preview">{message.content?.substring(0, 50)}...</div>
    </div>
  );
}
