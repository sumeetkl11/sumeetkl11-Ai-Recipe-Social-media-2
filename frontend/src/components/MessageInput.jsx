// frontend/ai-recipe-generator-ui-boilerplate-code/src/components/MessageInput.jsx
import React, { useState } from 'react';
import { buildApiUrl } from '../services/api';
import { emitTypingStart, emitTypingEnd } from '../services/socket';
import '../styles/MessageInput.css';

export default function MessageInput({ conversationId, onMessageSent }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(
        buildApiUrl(`/conversations/${conversationId}/messages`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content: message })
        }
      );

      if (response.ok) {
        setMessage('');
        onMessageSent?.();
        
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
