// frontend/ai-recipe-generator-ui-boilerplate-code/src/components/MessageThread.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../services/api';
import { joinConversation, leaveConversation, onNewMessage, offEvent } from '../services/socket';
import useRevalidateOnFocus from '../hooks/useRevalidateOnFocus';
import UserAvatar from './UserAvatar';
import '../styles/MessageThread.css';

export default function MessageThread({ conversation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const conversationId = conversation?.id;

  const token = localStorage.getItem('token');

  const fetchMessages = useCallback(async (options = {}) => {
    if (!conversationId) {
      return;
    }

    const silent = options.silent && messages.length > 0;

    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await fetch(
        buildApiUrl(`/conversations/${conversationId}/messages?limit=50`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, messages.length, token]);

  const handleNewMessage = useCallback((newMessage) => {
    if (newMessage.conversation_id !== conversationId) {
      return;
    }

    setMessages((prev) => {
      if (prev.some((item) => item.id === newMessage.id)) {
        return prev;
      }

      return [...prev, newMessage];
    });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    fetchMessages();
    joinConversation(conversationId);
    onNewMessage(handleNewMessage);

    return () => {
      leaveConversation(conversationId);
      offEvent('message:new', handleNewMessage);
    };
  }, [conversationId, fetchMessages, handleNewMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useRevalidateOnFocus(() => fetchMessages({ silent: true }), {
    enabled: Boolean(conversationId),
    intervalMs: 15000,
    runOnMount: false
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!conversation) {
    return <div className="message-thread empty"><p>Select a conversation</p></div>;
  }

  if (loading) {
    return <div className="message-thread"><p>Loading messages...</p></div>;
  }

  return (
    <div className="message-thread">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
            >
              {msg.sender_id !== user?.id && (
                <UserAvatar
                  name={msg.sender_name}
                  src={msg.sender_avatar || msg.avatar_url}
                  className="sender-avatar"
                  textClassName="sender-avatar-text"
                />
              )}
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="timestamp">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
