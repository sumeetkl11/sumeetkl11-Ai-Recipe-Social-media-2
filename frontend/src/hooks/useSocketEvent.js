import { useEffect } from 'react';
import { getSocket } from '../services/socket';

/**
 * Custom hook for socket event listeners with automatic cleanup
 * Prevents memory leaks by removing listeners on unmount
 * 
 * @param {string} eventName - Socket event name to listen for
 * @param {Function} handler - Event handler function
 * @param {Array} deps - Dependencies array (like useEffect)
 * 
 * @example
 * useSocketEvent('message:new', (message) => {
 *   console.log('New message:', message);
 * }, []);
 */
export function useSocketEvent(eventName, handler, deps = []) {
  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) {
      console.warn(`Socket not initialized for event: ${eventName}`);
      return;
    }

    // Register event listener
    socket.on(eventName, handler);

    // Cleanup function removes listener on unmount
    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook for multiple socket events with cleanup
 * 
 * @param {Object} events - Object mapping event names to handlers
 * @param {Array} deps - Dependencies array
 * 
 * @example
 * useSocketEvents({
 *   'message:new': handleNewMessage,
 *   'typing:start': handleTypingStart,
 *   'typing:end': handleTypingEnd
 * }, [handleNewMessage, handleTypingStart, handleTypingEnd]);
 */
export function useSocketEvents(events, deps = []) {
  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) {
      console.warn('Socket not initialized for multiple events');
      return;
    }

    // Register all event listeners
    Object.entries(events).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    });

    // Cleanup function removes all listeners on unmount
    return () => {
      Object.entries(events).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, [...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default useSocketEvent;
