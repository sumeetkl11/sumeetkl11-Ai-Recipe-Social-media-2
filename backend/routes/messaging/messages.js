// backend/routes/messaging/messages.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import * as messageController from '../../controllers/messaging/messageController.js';

const router = express.Router();

// Protected routes
router.get('/', authMiddleware, messageController.getConversations);
router.post('/', authMiddleware, messageController.createConversation);
router.get('/:id/messages', authMiddleware, messageController.getMessages);
router.post('/:id/messages', authMiddleware, messageController.sendMessage);
router.delete('/:id', authMiddleware, messageController.deleteConversation);

// Message-specific routes
router.patch('/messages/:id/read', authMiddleware, messageController.markMessageAsRead);

export default router;
