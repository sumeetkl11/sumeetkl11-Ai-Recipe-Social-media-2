// backend/controllers/social/notificationController.js
import Notification from '../../models/social/Notification.js';
import { redisClient } from '../../cache/redis.js';

/**
 * Get notifications for current user (paginated)
 * @route GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findByUserId(userId, limit, offset);

    res.json({
      success: true,
      data: notifications,
      meta: { page, limit, total: notifications.length }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Get unread notification count
 * @route GET /api/notifications/unread
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    let unreadCount = 0;
    try {
      // Try to get from cache first
      const cacheKey = `app:notifications:${userId}:unread`;
      let cached = await redisClient.get(cacheKey);

      if (cached !== null) {
        unreadCount = parseInt(cached, 10);
      } else {
        unreadCount = await Notification.getUnreadCount(userId);
        // Cache for 10 minutes
        await redisClient.setex(cacheKey, 600, unreadCount.toString());
      }
    } catch (dbError) {
      console.warn('Database error fetching unread count, returning 0:', dbError.message);
      unreadCount = 0;
    }

    res.json({
      success: true,
      data: { unread_count: unreadCount },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      data: { unread_count: 0 }
    });
  }
};

/**
 * Mark single notification as read
 * @route PATCH /api/notifications/:id/read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await Notification.markAsRead(id);

    // Invalidate cache
    const cacheKey = `app:notifications:${userId}:unread`;
    await redisClient.del(cacheKey);

    res.json({
      success: true,
      data: { id },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedCount = await Notification.markAllAsRead(userId);

    // Invalidate cache
    const cacheKey = `app:notifications:${userId}:unread`;
    await redisClient.del(cacheKey);

    res.json({
      success: true,
      data: { updated_count: updatedCount },
      meta: { page: 1, limit: 1, total: updatedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await Notification.delete(id);

    // Invalidate cache
    const cacheKey = `app:notifications:${userId}:unread`;
    await redisClient.del(cacheKey);

    res.json({
      success: true,
      data: { id },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};
