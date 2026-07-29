// backend/models/messaging/Message.js
import { pool } from '../../config/db.js';

class Message {
  /**
   * Create a new message
   * @param {string} conversationId - Conversation ID
   * @param {string} senderId - Sender user ID
   * @param {string} content - Message content
   * @returns {Object} Created message
   */
  static async create({ conversationId, senderId, content }) {
    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, conversation_id, sender_id, content, is_read, created_at`,
      [conversationId, senderId, content]
    );
    return result.rows[0];
  }

  /**
   * Get messages for a conversation (paginated)
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Limit results
   * @param {number} offset - Offset results
   * @returns {Array} Messages with sender details
   */
  static async findByConversationId(conversationId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT 
        m.id, 
        m.conversation_id, 
        m.sender_id, 
        m.content, 
        m.is_read, 
        m.created_at,
        u.name as sender_name,
        u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows.reverse(); // Return in chronological order
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   */
  static async markAsRead(messageId) {
    await pool.query(
      `UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1`,
      [messageId]
    );
  }

  /**
   * Mark all messages as read in conversation (except sender's)
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   */
  static async markAllAsReadInConversation(conversationId, userId) {
    await pool.query(
      `UPDATE messages 
       SET is_read = true, updated_at = NOW() 
       WHERE conversation_id = $1 AND sender_id != $2`,
      [conversationId, userId]
    );
  }

  /**
   * Get unread message count for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @returns {number} Unread count
   */
  static async getUnreadCount(conversationId, userId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE conversation_id = $1 AND is_read = false AND sender_id != $2`,
      [conversationId, userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @returns {boolean} Success
   */
  static async delete(messageId) {
    const result = await pool.query(
      `DELETE FROM messages WHERE id = $1`,
      [messageId]
    );
    return result.rowCount > 0;
  }
}

export default Message;
