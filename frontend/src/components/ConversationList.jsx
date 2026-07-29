// frontend/ai-recipe-generator-ui-boilerplate-code/src/components/ConversationList.jsx
import React from 'react';
import '../styles/ConversationList.css';
import UserAvatar from './UserAvatar';

export default function ConversationList({ conversations = [], selectedConversation, onSelectConversation }) {
  const selectedConversationId = selectedConversation?.id;

  return (
    <div className="conversation-list">
      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map((convo) => (
          <button
            key={convo.id}
            type="button"
            className={`conversation-item ${convo.unread_count > 0 ? 'unread' : ''} ${selectedConversationId === convo.id ? 'selected' : ''}`}
            onClick={() => onSelectConversation(convo)}
          >
            <UserAvatar
              name={convo.other_user_name}
              src={convo.other_user_avatar}
              className="user-avatar"
              textClassName="user-avatar-text"
            />
            <div className="conversation-info">
              <h4>{convo.other_user_name}</h4>
              <p className="last-message">{convo.last_message || 'No messages yet'}</p>
            </div>
            {convo.unread_count > 0 && (
              <span className="unread-badge">{convo.unread_count}</span>
            )}
          </button>
        ))
      )}
    </div>
  );
}
