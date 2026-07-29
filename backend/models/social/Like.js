// backend/models/social/Like.js
import { pool } from '../../config/db.js';

class Like {
  /**
   * Create a new like
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {Object} Created like
   */
  static async create({ postId, userId }) {
    const result = await pool.query(
      `INSERT INTO likes (post_id, user_id)
       VALUES ($1, $2)
       RETURNING id, post_id, user_id, created_at`,
      [postId, userId]
    );
    return result.rows[0];
  }

  /**
   * Delete a like
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {boolean} Success
   */
  static async delete({ postId, userId }) {
    const result = await pool.query(
      `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    return result.rowCount > 0;
  }

  /**
   * Check if user already liked a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @returns {boolean} True if liked
   */
  static async exists({ postId, userId }) {
    const result = await pool.query(
      `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2 LIMIT 1`,
      [postId, userId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get all likes for a post
   * @param {string} postId - Post ID
   * @returns {Array} Array of likes with user details
   */
  static async findByPostId(postId) {
    const result = await pool.query(
      `SELECT 
        l.id, 
        l.user_id, 
        u.name as user_name,
        u.avatar_url,
        l.created_at
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = $1
       ORDER BY l.created_at DESC`,
      [postId]
    );
    return result.rows;
  }
}

export default Like;
