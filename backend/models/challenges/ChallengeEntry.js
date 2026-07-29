// backend/models/challenges/ChallengeEntry.js
import pool from '../../config/db.js';

class ChallengeEntry {
  /**
   * Get or create challenge entry for user
   * @param {string} challengeId - Challenge UUID
   * @param {string} userId - User UUID
   * @returns {Object} Challenge entry
   */
  static async getOrCreate(challengeId, userId) {
    const result = await pool.query(
      `INSERT INTO challenge_entries (challenge_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (challenge_id, user_id) DO UPDATE SET updated_at = NOW()
       RETURNING *`,
      [challengeId, userId]
    );
    
    return result.rows[0];
  }

  /**
   * Increment recipes completed for user in challenge
   * @param {string} challengeId - Challenge UUID
   * @param {string} userId - User UUID
   * @returns {Object} Updated entry
   */
  static async incrementRecipes(challengeId, userId) {
    const result = await pool.query(
      `UPDATE challenge_entries
       SET recipes_completed = recipes_completed + 1, updated_at = NOW()
       WHERE challenge_id = $1 AND user_id = $2
       RETURNING *`,
      [challengeId, userId]
    );
    
    return result.rows[0];
  }

  /**
   * Mark challenge as completed for user
   * @param {string} challengeId - Challenge UUID
   * @param {string} userId - User UUID
   * @returns {Object} Updated entry
   */
  static async markCompleted(challengeId, userId) {
    const result = await pool.query(
      `UPDATE challenge_entries
       SET completed_at = NOW(), updated_at = NOW()
       WHERE challenge_id = $1 AND user_id = $2
       RETURNING *`,
      [challengeId, userId]
    );
    
    return result.rows[0];
  }

  /**
   * Get user's participation in a challenge
   * @param {string} challengeId - Challenge UUID
   * @param {string} userId - User UUID
   * @returns {Object|null} Challenge entry or null
   */
  static async findByUserAndChallenge(challengeId, userId) {
    const result = await pool.query(
      `SELECT * FROM challenge_entries
       WHERE challenge_id = $1 AND user_id = $2`,
      [challengeId, userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Get all challenges for user
   * @param {string} userId - User UUID
   * @returns {Array} Array of challenge entries with challenge details
   */
  static async findByUser(userId) {
    const result = await pool.query(
      `SELECT ce.*, c.title, c.description, c.image_url, c.end_date
       FROM challenge_entries ce
       JOIN challenges c ON ce.challenge_id = c.id
       WHERE ce.user_id = $1
       ORDER BY c.end_date DESC`,
      [userId]
    );
    
    return result.rows;
  }

  /**
   * Get completed challenges for user
   * @param {string} userId - User UUID
   * @returns {Array} Array of completed challenge entries
   */
  static async findCompletedByUser(userId) {
    const result = await pool.query(
      `SELECT ce.*, c.title, c.description
       FROM challenge_entries ce
       JOIN challenges c ON ce.challenge_id = c.id
       WHERE ce.user_id = $1 AND ce.completed_at IS NOT NULL
       ORDER BY ce.completed_at DESC`,
      [userId]
    );
    
    return result.rows;
  }
}

export default ChallengeEntry;
