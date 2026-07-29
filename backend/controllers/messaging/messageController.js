// backend/controllers/messaging/messageController.js
import Conversation from '../../models/messaging/Conversation.js';
import Message from '../../models/messaging/Message.js';
import Notification from '../../models/social/Notification.js';
import { pool } from '../../config/db.js';
import { emitNotification } from '../../sockets/socialSocket.js';

/**
 * Get all conversations for current user
 * @route GET /api/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let conversations = [];
    let total = 0;
    
    try {
      conversations = await Conversation.findByUserId(userId, limit, offset);

      // Count total conversations
      const totalResult = await pool.query(
        `SELECT COUNT(*) as count FROM conversations 
         WHERE user_one_id = $1 OR user_two_id = $1`,
        [userId]
      );
      total = parseInt(totalResult.rows[0].count, 10);
    } catch (dbError) {
      console.warn('Database error fetching conversations:', dbError.message);
      conversations = [];
      total = 0;
    }

    res.json({
      success: true,
      data: conversations,
      meta: { page, limit, total }
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      data: [],
      meta: { page: 1, limit: 20, total: 0 }
    });
  }
};

/**
 * Start or get conversation with a user
 * @route POST /api/conversations
 */
export const createConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'otherUserId is required'
      });
    }

    if (userId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself'
      });
    }

    // Verify other user exists
    const userExists = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [otherUserId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const conversation = await Conversation.createOrGet(userId, otherUserId);
    const enriched = await Conversation.findByIdForUser(conversation.id, userId);

    res.status(201).json({
      success: true,
      data: enriched,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
};

/**
 * Get messages in a conversation (paginated, newest first)
 * @route GET /api/conversations/:id/messages
 */
export const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Verify user is part of conversation
    const convoResult = await pool.query(
      `SELECT user_one_id, user_two_id FROM conversations WHERE id = $1`,
      [conversationId]
    );

    if (convoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const { user_one_id, user_two_id } = convoResult.rows[0];
    if (userId !== user_one_id && userId !== user_two_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }

    await Message.markAllAsReadInConversation(conversationId, userId);

    const messages = await Message.findByConversationId(conversationId, limit, offset);

    // Count total messages
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    res.json({
      success: true,
      data: messages,
      meta: { page, limit, total }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

/**
 * Send a message in a conversation
 * @route POST /api/conversations/:id/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify user is part of conversation
    const convoResult = await pool.query(
      `SELECT user_one_id, user_two_id FROM conversations WHERE id = $1`,
      [conversationId]
    );

    if (convoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const { user_one_id, user_two_id } = convoResult.rows[0];
    if (userId !== user_one_id && userId !== user_two_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }

    // Create message and update conversation timestamp
    const message = await Message.create({ conversationId, senderId: userId, content });

    await pool.query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    // Emit real-time message via Socket.io
    if (global.io) {
      const otherUserId = userId === user_one_id ? user_two_id : user_one_id;
      const messageWithSender = await pool.query(
        `SELECT m.*, u.name as sender_name, u.avatar_url FROM messages m
         JOIN users u ON m.sender_id = u.id WHERE m.id = $1`,
        [message.id]
      );
      
      global.io.to(`conversation:${conversationId}`).emit('message:new', messageWithSender.rows[0]);

      try {
        const notification = await Notification.create({
          userId: otherUserId,
          actorId: userId,
          type: 'message'
        });

        const notificationPayload = await Notification.findById(notification.id);
        if (notificationPayload) {
          emitNotification(global.io, otherUserId, notificationPayload);
        }
      } catch (notificationError) {
        console.error('Error creating message notification:', notificationError);
      }
    }

    res.status(201).json({
      success: true,
      data: message,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

/**
 * Mark message as read
 * @route PATCH /api/messages/:id/read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    await Message.markAsRead(messageId);

    res.json({
      success: true,
      data: { messageId },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

/**
 * Delete conversation (removes all messages)
 * @route DELETE /api/conversations/:id
 */
export const deleteConversation = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const convoResult = await pool.query(
      `SELECT user_one_id, user_two_id FROM conversations WHERE id = $1`,
      [conversationId]
    );

    if (convoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const { user_one_id, user_two_id } = convoResult.rows[0];
    if (userId !== user_one_id && userId !== user_two_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this conversation'
      });
    }

    await Conversation.delete(conversationId);

    res.json({
      success: true,
      data: { conversationId },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
};
