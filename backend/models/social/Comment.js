// backend/models/social/Comment.js
import { pool } from '../../config/db.js';

class Comment {
  /**
   * Create a new comment on a post
   * @param {string} postId - Post ID
   * @param {string} userId - User ID
   * @param {string} content - Comment content
   * @returns {Object} Created comment
   */
  static async create({ postId, userId, content }) {
    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, content, created_at`,
      [postId, userId, content]
    );
    return result.rows[0];
  }

  /**
   * Get comments for a post (paginated)
   * @param {string} postId - Post ID
   * @param {number} limit - Results per page
   * @param {number} offset - Pagination offset
   * @returns {Array} Array of comments with user details
   */
  static async findByPostId(postId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.created_at,
        u.name as author_name,
        u.avatar_url as author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Get comment by ID
   * @param {string} commentId - Comment ID
   * @returns {Object} Comment with user details
   */
  static async findById(commentId) {
    const result = await pool.query(
      `SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.created_at,
        u.name as author_name,
        u.avatar_url as author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [commentId]
    );
    return result.rows[0];
  }

  /**
   * Delete a comment by ID
   * @param {string} commentId - Comment ID
   */
  static async delete(commentId) {
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
  }

  /**
   * Check if comment exists
   * @param {string} commentId - Comment ID
   * @returns {boolean} True if comment exists
   */
  static async exists(commentId) {
    const result = await pool.query(
      'SELECT id FROM comments WHERE id = $1',
      [commentId]
    );
    return result.rows.length > 0;
  }
}

export default Comment;
