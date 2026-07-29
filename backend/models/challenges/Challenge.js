// backend/models/challenges/Challenge.js
import pool from '../../config/db.js';

class Challenge {
  /**
   * Create a new challenge
   * @param {Object} data - Challenge data { title, description, imageUrl, startDate, endDate, recipeIds, createdBy }
   * @returns {Object} Created challenge
   */
  static async create(data) {
    const { title, description, imageUrl, startDate, endDate, recipeIds, createdBy } = data;
    
    const result = await pool.query(
      `INSERT INTO challenges (title, description, image_url, start_date, end_date, recipe_ids, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, imageUrl, startDate, endDate, recipeIds || [], createdBy]
    );
    
    return result.rows[0];
  }

  /**
   * Get challenge by ID
   * @param {string} challengeId - Challenge UUID
   * @returns {Object} Challenge with participant count
   */
  static async findById(challengeId) {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT ce.user_id) as participant_count
       FROM challenges c
       LEFT JOIN challenge_entries ce ON c.id = ce.challenge_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [challengeId]
    );
    
    return result.rows[0];
  }

  /**
   * Get all active challenges (within date range)
   * @param {number} limit - Pagination limit
   * @param {number} offset - Pagination offset
   * @returns {Array} Array of challenges
   */
  static async findActive(limit = 20, offset = 0) {
    const now = new Date().toISOString();
    
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT ce.user_id) as participant_count
       FROM challenges c
       LEFT JOIN challenge_entries ce ON c.id = ce.challenge_id
       WHERE c.start_date <= $1 AND c.end_date >= $1
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [now, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Get challenge leaderboard (ranked by recipes completed)
   * @param {string} challengeId - Challenge UUID
   * @param {number} limit - Top N users
   * @returns {Array} Leaderboard entries
   */
  static async getLeaderboard(challengeId, limit = 20) {
    const result = await pool.query(
      `SELECT ce.*, u.name, u.avatar_url
       FROM challenge_entries ce
       JOIN users u ON ce.user_id = u.id
       WHERE ce.challenge_id = $1
       ORDER BY ce.recipes_completed DESC, ce.created_at ASC
       LIMIT $2`,
      [challengeId, limit]
    );
    
    return result.rows;
  }

  /**
   * Update challenge participant count (called when user joins)
   * @param {string} challengeId - Challenge UUID
   */
  static async updateParticipantCount(challengeId) {
    const result = await pool.query(
      `UPDATE challenges
       SET participant_count = (SELECT COUNT(DISTINCT user_id) FROM challenge_entries WHERE challenge_id = $1)
       WHERE id = $1
       RETURNING participant_count`,
      [challengeId]
    );
    
    return result.rows[0];
  }

  /**
   * Get challenges by creator
   * @param {string} createdBy - User UUID
   * @returns {Array} Array of challenges
   */
  static async findByCreator(createdBy) {
    const result = await pool.query(
      `SELECT * FROM challenges WHERE created_by = $1 ORDER BY created_at DESC`,
      [createdBy]
    );
    
    return result.rows;
  }

  /**
   * Delete challenge
   * @param {string} challengeId - Challenge UUID
   * @param {string} userId - User UUID (must be creator)
   */
  static async delete(challengeId, userId) {
    // Verify user is creator
    const verifyResult = await pool.query(
      'SELECT created_by FROM challenges WHERE id = $1',
      [challengeId]
    );
    
    if (!verifyResult.rows[0] || verifyResult.rows[0].created_by !== userId) {
      throw new Error('Only challenge creator can delete');
    }
    
    await pool.query('DELETE FROM challenges WHERE id = $1', [challengeId]);
  }
}

export default Challenge;
