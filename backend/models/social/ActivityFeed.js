// backend/models/social/ActivityFeed.js
import { pool } from '../../config/db.js';

class ActivityFeed {
  /**
   * Create activity entry
   * @param {string} userId - User who performed action
   * @param {string} actionType - Type of action (cooked, saved, followed, etc)
   * @param {string} recipeId - Recipe ID (optional)
   * @param {string} postId - Post ID (optional)
   * @param {Object} additionalData - Extra data as JSON
   * @returns {Object} Activity entry
   */
  static async create({ userId, actionType, recipeId, postId, additionalData }) {
    const result = await pool.query(
      `INSERT INTO activity_feed (user_id, action_type, recipe_id, post_id, additional_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, action_type, recipe_id, post_id, created_at`,
      [userId, actionType, recipeId, postId, additionalData ? JSON.stringify(additionalData) : null]
    );
    return result.rows[0];
  }

  /**
   * Get activity feed for users (what friends did)
   * @param {Array} userIds - Array of user IDs to get activity for
   * @param {number} limit - Limit results
   * @param {number} offset - Offset results
   * @returns {Array} Activity feed entries
   */
  static async getFollowingActivity(userIds, limit = 20, offset = 0) {
    if (userIds.length === 0) return [];

    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(
      `SELECT 
        a.id, 
        a.user_id, 
        a.action_type, 
        a.recipe_id, 
        a.post_id, 
        a.additional_data, 
        a.created_at,
        u.name as user_name,
        u.avatar_url,
        r.name as recipe_name,
        p.caption as post_caption
       FROM activity_feed a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN recipes r ON a.recipe_id = r.id
       LEFT JOIN posts p ON a.post_id = p.id
       WHERE a.user_id = ANY(ARRAY[${placeholders}])
       ORDER BY a.created_at DESC
       LIMIT $${userIds.length + 1} OFFSET $${userIds.length + 2}`,
      [...userIds, limit, offset]
    );
    return result.rows;
  }

  /**
   * Get user's recent activity
   * @param {string} userId - User ID
   * @param {number} limit - Limit results
   * @returns {Array} User's activity
   */
  static async getUserActivity(userId, limit = 20) {
    const result = await pool.query(
      `SELECT 
        a.id, 
        a.action_type, 
        a.recipe_id, 
        a.post_id, 
        a.created_at,
        r.name as recipe_name,
        p.caption as post_caption
       FROM activity_feed a
       LEFT JOIN recipes r ON a.recipe_id = r.id
       LEFT JOIN posts p ON a.post_id = p.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }
}

export default ActivityFeed;
