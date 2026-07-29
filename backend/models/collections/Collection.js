// backend/models/collections/Collection.js
import pool from '../../config/db.js';

class Collection {
  /**
   * Create a new collection
   * @param {Object} data - Collection data { userId, title, description, isPublic }
   * @returns {Object} Created collection
   */
  static async create(data) {
    const { userId, title, description, isPublic } = data;
    
    const result = await pool.query(
      `INSERT INTO collections (user_id, title, description, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, description, isPublic || false]
    );
    
    return result.rows[0];
  }

  /**
   * Get collection by ID with recipe count
   * @param {string} collectionId - Collection UUID
   * @returns {Object} Collection with recipe details
   */
  static async findById(collectionId) {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT cr.recipe_id) as recipe_count
       FROM collections c
       LEFT JOIN collection_recipes cr ON c.id = cr.collection_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [collectionId]
    );
    
    return result.rows[0];
  }

  /**
   * Get all collections for user
   * @param {string} userId - User UUID
   * @returns {Array} Array of collections
   */
  static async findByUser(userId) {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT cr.recipe_id) as recipe_count
       FROM collections c
       LEFT JOIN collection_recipes cr ON c.id = cr.collection_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    return result.rows;
  }

  /**
   * Get public collections (for discovery/trending)
   * @param {number} limit - Pagination limit
   * @param {number} offset - Pagination offset
   * @returns {Array} Array of public collections
   */
  static async findPublic(limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT c.*, u.name, u.avatar_url, COUNT(DISTINCT cr.recipe_id) as recipe_count
       FROM collections c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN collection_recipes cr ON c.id = cr.collection_id
       WHERE c.is_public = true
       GROUP BY c.id, u.id
       ORDER BY c.save_count DESC, c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Update collection info
   * @param {string} collectionId - Collection UUID
   * @param {string} userId - User UUID (must be owner)
   * @param {Object} updates - { title, description, isPublic }
   * @returns {Object} Updated collection
   */
  static async update(collectionId, userId, updates) {
    // Verify ownership
    const ownerResult = await pool.query(
      'SELECT user_id FROM collections WHERE id = $1',
      [collectionId]
    );
    
    if (!ownerResult.rows[0] || ownerResult.rows[0].user_id !== userId) {
      throw new Error('Only collection owner can update');
    }

    const { title, description, isPublic } = updates;
    const result = await pool.query(
      `UPDATE collections
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description, isPublic, collectionId]
    );
    
    return result.rows[0];
  }

  /**
   * Delete collection
   * @param {string} collectionId - Collection UUID
   * @param {string} userId - User UUID (must be owner)
   */
  static async delete(collectionId, userId) {
    // Verify ownership
    const ownerResult = await pool.query(
      'SELECT user_id FROM collections WHERE id = $1',
      [collectionId]
    );
    
    if (!ownerResult.rows[0] || ownerResult.rows[0].user_id !== userId) {
      throw new Error('Only collection owner can delete');
    }

    await pool.query('DELETE FROM collections WHERE id = $1', [collectionId]);
  }

  /**
   * Get trending collections (by save count)
   * @param {number} limit - How many to return
   * @returns {Array} Array of trending collections
   */
  static async getTrending(limit = 10) {
    const result = await pool.query(
      `SELECT c.*, u.name, u.avatar_url, COUNT(DISTINCT cr.recipe_id) as recipe_count
       FROM collections c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN collection_recipes cr ON c.id = cr.collection_id
       WHERE c.is_public = true
       GROUP BY c.id, u.id
       ORDER BY c.save_count DESC, c.created_at DESC
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }
}

export default Collection;
