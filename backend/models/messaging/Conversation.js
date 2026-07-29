// backend/models/messaging/Conversation.js
import { pool } from '../../config/db.js';

class Conversation {
  /**
   * Create or get conversation between two users
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Object} Conversation
   */
  static async createOrGet(userId1, userId2) {
    // Normalize order for uniqueness
    const [user_one_id, user_two_id] = userId1 < userId2 
      ? [userId1, userId2] 
      : [userId2, userId1];

    const result = await pool.query(
      `INSERT INTO conversations (user_one_id, user_two_id)
       VALUES ($1, $2)
       ON CONFLICT (user_one_id, user_two_id) DO UPDATE
       SET updated_at = NOW()
       RETURNING id, user_one_id, user_two_id, last_message_at, created_at`,
      [user_one_id, user_two_id]
    );
    return result.rows[0];
  }

  /**
   * Get conversation by ID with participant details
   * @param {string} conversationId - Conversation ID
   * @returns {Object} Conversation with users
   */
  static async findById(conversationId) {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.user_one_id, 
        c.user_two_id, 
        c.last_message_at, 
        c.created_at,
        u1.name as user_one_name,
        u1.avatar_url as user_one_avatar,
        u2.name as user_two_name,
        u2.avatar_url as user_two_avatar
       FROM conversations c
       JOIN users u1 ON c.user_one_id = u1.id
       JOIN users u2 ON c.user_two_id = u2.id
       WHERE c.id = $1`,
      [conversationId]
    );
    return result.rows[0];
  }

  /**
   * Get conversation by ID enriched for a specific viewer
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @returns {Object} Conversation with "other user" fields
   */
  static async findByIdForUser(conversationId, userId) {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.user_one_id, 
        c.user_two_id, 
        c.last_message_at,
        c.created_at,
        CASE 
          WHEN c.user_one_id = $2 THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN c.user_one_id = $2 THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE 
          WHEN c.user_one_id = $2 THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $2) as unread_count
       FROM conversations c
       JOIN users u1 ON c.user_one_id = u1.id
       JOIN users u2 ON c.user_two_id = u2.id
       WHERE c.id = $1`,
      [conversationId, userId]
    );
    return result.rows[0];
  }

  /**
   * Get all conversations for a user
   * @param {string} userId - User ID
   * @param {number} limit - Limit results
   * @param {number} offset - Offset results
   * @returns {Array} User's conversations
   */
  static async findByUserId(userId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT 
        c.id, 
        c.user_one_id, 
        c.user_two_id, 
        c.last_message_at,
        CASE 
          WHEN c.user_one_id = $1 THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN c.user_one_id = $1 THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE 
          WHEN c.user_one_id = $1 THEN u2.avatar_url
          ELSE u1.avatar_url
        END as other_user_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $1) as unread_count
       FROM conversations c
       JOIN users u1 ON c.user_one_id = u1.id
       JOIN users u2 ON c.user_two_id = u2.id
       WHERE c.user_one_id = $1 OR c.user_two_id = $1
       ORDER BY c.last_message_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Delete conversation (removes all messages)
   * @param {string} conversationId - Conversation ID
   * @returns {boolean} Success
   */
  static async delete(conversationId) {
    const result = await pool.query(
      `DELETE FROM conversations WHERE id = $1`,
      [conversationId]
    );
    return result.rowCount > 0;
  }
}

export default Conversation;
