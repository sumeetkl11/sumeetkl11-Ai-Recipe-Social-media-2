// frontend/ai-recipe-generator-ui-boilerplate-code/src/components/MessageThread.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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

  const hasMessagesRef = useRef(false);
  hasMessagesRef.current = messages.length > 0;

  const fetchMessages = useCallback(async (options = {}) => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const silent = options.silent && hasMessagesRef.current;

    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await api.get(`/conversations/${conversationId}/messages?limit=50`);
      if (response.data?.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

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
