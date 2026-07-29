// backend/routes/social/notifications.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import * as notificationController from '../../controllers/social/notificationController.js';

const router = express.Router();

// Protected routes (all require auth)
router.get('/', authMiddleware, notificationController.getNotifications);
router.get('/unread', authMiddleware, notificationController.getUnreadCount);
router.patch('/:id/read', authMiddleware, notificationController.markNotificationAsRead);
router.patch('/read-all', authMiddleware, notificationController.markAllNotificationsAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

export default router;
