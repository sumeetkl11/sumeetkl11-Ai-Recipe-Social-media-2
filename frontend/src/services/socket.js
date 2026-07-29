import io from 'socket.io-client';
import { SOCKET_URL } from './api';

let socketInstance = null;

/**
 * Socket.io client initialization
 * Connects to backend with JWT authentication
 * @param {string} token - JWT authentication token
 * @returns {socket.io.Socket} Socket instance
 */
export function initializeSocket(token) {
  if (socketInstance) {
    if (socketInstance.connected) {
      console.log('✅ Socket.io already connected:', socketInstance.id);
      return socketInstance;
    }

    if (socketInstance.active) {
      console.log('⏳ Socket.io connection in progress');
      return socketInstance;
    }

    socketInstance.auth = token ? { token } : {};
    socketInstance.connect();
    return socketInstance;
  }

  socketInstance = io(SOCKET_URL, {
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    transports: ['websocket', 'polling'],
    forceNew: false,
  });

  // Connection events
  socketInstance.on('connect', () => {
    console.log('✅ Socket.io connected:', socketInstance.id || '(pending id)');
  });

  socketInstance.on('connection:success', (data) => {
    console.log('✅ Socket.io authenticated:', data);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('❌ Socket.io disconnected:', reason);
  });

  socketInstance.on('connect_error', (error) => {
    console.error('Socket.io connection error:', error);
  });

  socketInstance.on('error', (error) => {
    console.error('Socket.io error:', error);
  });

  // Make socket available globally for debugging
  window.socket = socketInstance;

  return socketInstance;
}

/**
 * Get the current socket instance
 */
export function getSocket() {
  return socketInstance;
}

/**
 * Disconnect Socket.io
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * Join a conversation room to receive real-time messages
 * @param {string} conversationId - Conversation ID
 */
export function joinConversation(conversationId) {
  if (window.socket?.connected) {
    window.socket.emit('conversation:join', conversationId);
  }
}

/**
 * Leave a conversation room
 * @param {string} conversationId - Conversation ID
 */
export function leaveConversation(conversationId) {
  if (window.socket?.connected) {
    window.socket.emit('conversation:leave', conversationId);
  }
}

/**
 * Emit typing start indicator
 * @param {string} conversationId - Conversation ID
 */
export function emitTypingStart(conversationId) {
  if (window.socket?.connected) {
    window.socket.emit('typing:start', conversationId);
  }
}

/**
 * Emit typing end indicator
 * @param {string} conversationId - Conversation ID
 */
export function emitTypingEnd(conversationId) {
  if (window.socket?.connected) {
    window.socket.emit('typing:end', conversationId);
  }
}

/**
 * Listen for new messages in a conversation
 * @param {function} callback - Function to call when message received
 */
export function onNewMessage(callback) {
  if (window.socket) {
    window.socket.on('message:new', callback);
  }
}

/**
 * Listen for typing indicators
 * @param {function} callback - Function to call when typing event occurs
 */
export function onTypingStart(callback) {
  if (window.socket) {
    window.socket.on('typing:start', callback);
  }
}

export function onTypingEnd(callback) {
  if (window.socket) {
    window.socket.on('typing:end', callback);
  }
}

/**
 * Listen for new notifications
 * @param {function} callback - Function to call when notification received
 */
export function onNewNotification(callback) {
  if (window.socket) {
    window.socket.on('notification:new', callback);
  }
}

/**
 * Listen for activity feed updates
 * @param {function} callback - Function to call when activity occurs
 */
export function onActivityUpdate(callback) {
  if (window.socket) {
    window.socket.on('activity:post', callback);
    window.socket.on('activity:like', callback);
    window.socket.on('activity:streak', callback);
  }
}

/**
 * Remove event listener
 * @param {string} event - Event name
 * @param {function} callback - Callback function to remove
 */
export function offEvent(event, callback) {
  if (window.socket) {
    window.socket.off(event, callback);
  }
}
