// backend/models/social/Streak.js
import { pool } from '../../config/db.js';

class Streak {
  /**
   * Get or create streak record for user
   * @param {string} userId - User ID
   * @returns {Object} Streak record
   */
  static async getOrCreate(userId) {
    const result = await pool.query(
      `INSERT INTO streaks (user_id, current_streak, longest_streak)
       VALUES ($1, 0, 0)
       ON CONFLICT (user_id) DO UPDATE
       SET updated_at = NOW()
       RETURNING id, user_id, current_streak, longest_streak, last_cooked_date`,
      [userId]
    );
    return result.rows[0];
  }

  /**
   * Get streak by user ID
   * @param {string} userId - User ID
   * @returns {Object} Streak record
   */
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT id, user_id, current_streak, longest_streak, last_cooked_date
       FROM streaks WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  /**
   * Update streak on cook event
   * Increments streak if cooked today, resets if missed day
   * @param {string} userId - User ID
   * @returns {Object} Updated streak
   */
  static async updateOnCook(userId) {
    const today = new Date().toISOString().split('T')[0];

    const streak = await this.getOrCreate(userId);
    if (!streak.last_cooked_date) {
      // First cook ever
      return await pool.query(
        `UPDATE streaks 
         SET current_streak = 1, longest_streak = 1, last_cooked_date = $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING user_id, current_streak, longest_streak, last_cooked_date`,
        [today, userId]
      );
    }

    const lastDate = new Date(streak.last_cooked_date).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = 1;
    if (lastDate === today) {
      // Already cooked today, don't increment
      return streak;
    } else if (lastDate === yesterday) {
      // Consecutive day, increment
      newStreak = streak.current_streak + 1;
    }
    // else: streak broken, start over at 1

    const longestStreak = Math.max(streak.longest_streak, newStreak);

    const result = await pool.query(
      `UPDATE streaks 
       SET current_streak = $1, longest_streak = $2, last_cooked_date = $3, updated_at = NOW()
       WHERE user_id = $4
       RETURNING user_id, current_streak, longest_streak, last_cooked_date`,
      [newStreak, longestStreak, today, userId]
    );

    return result.rows[0];
  }

  /**
   * Get top streaks (leaderboard)
   * @param {number} limit - Limit results
   * @returns {Array} Top users by streak
   */
  static async getTopStreaks(limit = 20) {
    const result = await pool.query(
      `SELECT 
        s.user_id, 
        s.current_streak, 
        s.longest_streak,
        u.name,
        u.avatar_url
       FROM streaks s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.current_streak DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}

export default Streak;
