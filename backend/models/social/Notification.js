// backend/models/social/Notification.js
import { pool } from '../../config/db.js';

class Notification {
  static schemaCache = null;

  static async getSchemaConfig() {
    if (Notification.schemaCache) {
      return Notification.schemaCache;
    }

    const result = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'notifications'
         AND column_name IN ('comment_id', 'updated_at')`
    );

    const columns = new Set(result.rows.map((row) => row.column_name));

    Notification.schemaCache = {
      hasCommentId: columns.has('comment_id'),
      hasUpdatedAt: columns.has('updated_at')
    };

    return Notification.schemaCache;
  }

  /**
   * Create a new notification
   * @param {string} userId - Recipient user ID
   * @param {string} actorId - Actor user ID (who caused the event)
   * @param {string} type - Notification type (like, comment, follow, etc)
   * @param {string} postId - Post ID (optional)
   * @param {string} commentId - Comment ID (optional)
   * @returns {Object} Created notification
   */
  static async create({ userId, actorId, type, postId, commentId }) {
    const schema = await Notification.getSchemaConfig();
    const columns = ['user_id', 'actor_id', 'type', 'post_id'];
    const values = [userId, actorId, type, postId || null];

    if (schema.hasCommentId) {
      columns.push('comment_id');
      values.push(commentId || null);
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const returningColumns = schema.hasCommentId
      ? 'id, user_id, actor_id, type, post_id, comment_id, is_read, created_at'
      : 'id, user_id, actor_id, type, post_id, NULL::UUID AS comment_id, is_read, created_at';

    const result = await pool.query(
      `INSERT INTO notifications (${columns.join(', ')})
       VALUES (${placeholders})
       RETURNING ${returningColumns}`,
      values
    );
    return result.rows[0];
  }

  /**
   * Get notifications for a user (paginated)
   * @param {string} userId - User ID
   * @param {number} limit - Limit results
   * @param {number} offset - Offset results
   * @returns {Array} Array of notifications with actor details
   */
  static async findByUserId(userId, limit = 20, offset = 0) {
    const schema = await Notification.getSchemaConfig();
    const commentSelect = schema.hasCommentId ? 'n.comment_id' : 'NULL::UUID AS comment_id';

    const result = await pool.query(
      `SELECT 
        n.id, 
        n.user_id, 
        n.actor_id, 
        n.type, 
        n.post_id, 
        ${commentSelect}, 
        n.is_read, 
        n.created_at,
        u.name as actor_name,
        u.avatar_url as actor_avatar
       FROM notifications n
       JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async findById(notificationId) {
    const schema = await Notification.getSchemaConfig();
    const commentSelect = schema.hasCommentId ? 'n.comment_id' : 'NULL::UUID AS comment_id';

    const result = await pool.query(
      `SELECT 
        n.id, 
        n.user_id, 
        n.actor_id, 
        n.type, 
        n.post_id, 
        ${commentSelect}, 
        n.is_read, 
        n.created_at,
        u.name as actor_name,
        u.avatar_url as actor_avatar
       FROM notifications n
       JOIN users u ON n.actor_id = u.id
       WHERE n.id = $1`,
      [notificationId]
    );
    return result.rows[0];
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {number} Unread count
   */
  static async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Mark single notification as read
   * @param {string} notificationId - Notification ID
   * @returns {boolean} Success
   */
  static async markAsRead(notificationId) {
    const schema = await Notification.getSchemaConfig();
    const updatedAtClause = schema.hasUpdatedAt ? ', updated_at = NOW()' : '';

    const result = await pool.query(
      `UPDATE notifications SET is_read = true${updatedAtClause} WHERE id = $1`,
      [notificationId]
    );
    return result.rowCount > 0;
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {number} Updated count
   */
  static async markAllAsRead(userId) {
    const schema = await Notification.getSchemaConfig();
    const updatedAtClause = schema.hasUpdatedAt ? ', updated_at = NOW()' : '';

    const result = await pool.query(
      `UPDATE notifications SET is_read = true${updatedAtClause} WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return result.rowCount;
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {boolean} Success
   */
  static async delete(notificationId) {
    const result = await pool.query(
      `DELETE FROM notifications WHERE id = $1`,
      [notificationId]
    );
    return result.rowCount > 0;
  }

  /**
   * Check if notification already exists (prevent duplicates)
   * @param {string} userId - User ID
   * @param {string} actorId - Actor ID
   * @param {string} type - Type
   * @param {string} postId - Post ID
   * @returns {boolean} Exists
   */
  static async exists({ userId, actorId, type, postId }) {
    const result = await pool.query(
      `SELECT id FROM notifications 
       WHERE user_id = $1 AND actor_id = $2 AND type = $3 AND post_id = $4 
       AND created_at > NOW() - INTERVAL '1 day'
       LIMIT 1`,
      [userId, actorId, type, postId]
    );
    return result.rows.length > 0;
  }
}

export default Notification;
