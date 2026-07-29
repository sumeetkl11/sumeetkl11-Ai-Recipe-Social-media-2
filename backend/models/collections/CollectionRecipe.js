// backend/models/collections/CollectionRecipe.js
import pool from '../../config/db.js';

class CollectionRecipe {
  /**
   * Add recipe to collection
   * @param {string} collectionId - Collection UUID
   * @param {string} recipeId - Recipe UUID
   * @returns {Object} Created collection_recipe record
   */
  static async addRecipe(collectionId, recipeId) {
    const result = await pool.query(
      `INSERT INTO collection_recipes (collection_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT (collection_id, recipe_id) DO UPDATE SET added_at = NOW()
       RETURNING *`,
      [collectionId, recipeId]
    );
    
    return result.rows[0];
  }

  /**
   * Remove recipe from collection
   * @param {string} collectionId - Collection UUID
   * @param {string} recipeId - Recipe UUID
   */
  static async removeRecipe(collectionId, recipeId) {
    await pool.query(
      'DELETE FROM collection_recipes WHERE collection_id = $1 AND recipe_id = $2',
      [collectionId, recipeId]
    );
  }

  /**
   * Get all recipes in a collection
   * @param {string} collectionId - Collection UUID
   * @param {number} limit - Pagination limit
   * @param {number} offset - Pagination offset
   * @returns {Array} Array of recipes with metadata
   */
  static async getRecipes(collectionId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT r.*, cr.added_at
       FROM collection_recipes cr
       JOIN recipes r ON cr.recipe_id = r.id
       WHERE cr.collection_id = $1
       ORDER BY cr.added_at DESC
       LIMIT $2 OFFSET $3`,
      [collectionId, limit, offset]
    );
    
    return result.rows;
  }

  /**
   * Check if recipe is in collection
   * @param {string} collectionId - Collection UUID
   * @param {string} recipeId - Recipe UUID
   * @returns {boolean} True if recipe is in collection
   */
  static async isRecipeInCollection(collectionId, recipeId) {
    const result = await pool.query(
      'SELECT id FROM collection_recipes WHERE collection_id = $1 AND recipe_id = $2',
      [collectionId, recipeId]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Get recipe count for collection
   * @param {string} collectionId - Collection UUID
   * @returns {number} Number of recipes in collection
   */
  static async getRecipeCount(collectionId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM collection_recipes WHERE collection_id = $1',
      [collectionId]
    );
    
    return parseInt(result.rows[0].count);
  }
}

export default CollectionRecipe;
