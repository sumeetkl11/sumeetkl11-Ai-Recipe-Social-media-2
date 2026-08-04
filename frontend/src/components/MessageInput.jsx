import React, { useState } from 'react';
import api from '../services/api';
import { emitTypingStart, emitTypingEnd } from '../services/socket';
import '../styles/MessageInput.css';

export default function MessageInput({ conversationId, onMessageSent }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        content: message
      });

      if (response.data?.success || response.status === 201 || response.status === 200) {
        const sentData = response.data?.data;
        setMessage('');
        onMessageSent?.(sentData);
        
        // Emit typing end
        emitTypingEnd(conversationId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    // Emit typing indicator
    if (e.target.value.length > 0) {
      emitTypingStart(conversationId);
    }
  };

  return (
    <div className="message-input">
      <textarea
        placeholder="Type a message... (Shift+Enter for newline)"
        value={message}
        onChange={handleTyping}
        onKeyPress={handleKeyPress}
        disabled={loading}
        rows="3"
      />
      <button
        onClick={handleSend}
        disabled={loading || !message.trim()}
        className="send-btn"
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
