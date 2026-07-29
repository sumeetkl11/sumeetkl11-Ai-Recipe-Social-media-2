import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { buildApiUrl } from '../services/api';
import { getSocket, onNewNotification, offEvent } from '../services/socket';
import toast from 'react-hot-toast';
import UserAvatar from './UserAvatar';
import '../styles/NotificationBadge.css';

export default function NotificationBadge() {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const rootRef = useRef(null);

  const token = localStorage.getItem('token');

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        buildApiUrl('/notifications/unread'),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.success) {
        setUnreadCount(result.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        buildApiUrl('/notifications?limit=5'),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();

    const handleNewNotification = (data) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
      toast.success(getToastMessage(data), {
        duration: 3000
      });
    };

    const socket = getSocket();
    if (socket) {
      onNewNotification(handleNewNotification);
    }

    return () => {
      if (socket) {
        offEvent('notification:new', handleNewNotification);
      }
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBadgeClick = () => {
    if (!showDropdown) {
      fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        buildApiUrl('/notifications/read-all'),
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to mark notifications as read');
      }

      setUnreadCount(0);
      setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast.error(err.message || 'Could not mark notifications as read');
    }
  };

  return (
    <div className="notification-badge" ref={rootRef}>
      <button
        className="notification-icon"
        onClick={handleBadgeClick}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="badge-count">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-read-btn"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-message">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${
                    notif.is_read ? 'read' : 'unread'
                  }`}
                >
                  <UserAvatar
                    name={notif.actor_name || user?.name || 'Notification'}
                    src={notif.actor_avatar}
                    size={32}
                    className="actor-avatar"
                    textClassName="font-bold text-slate-950"
                  />
                  <div className="notification-content">
                    <p>
                      <strong>{notif.actor_name}</strong>
                      {notif.type === 'like' && ' ❤️ liked your post'}
                      {notif.type === 'comment' && ' 💬 commented on your post'}
                      {notif.type === 'follow' && ' 🎉 started following you'}
                      {notif.type === 'message' && ' ✉️ sent you a message'}
                    </p>
                    <span className="timestamp">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getToastMessage(notification) {
  const actorName = notification.actor_name || 'Someone';

  if (notification.type === 'like') {
    return `${actorName} liked your post`;
  }

  if (notification.type === 'comment') {
    return `${actorName} commented on your post`;
  }

  if (notification.type === 'follow') {
    return `${actorName} started following you`;
  }

  if (notification.type === 'message') {
    return `${actorName} sent you a message`;
  }

  return `${actorName} sent a notification`;
}
