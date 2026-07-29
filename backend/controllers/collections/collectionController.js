// backend/controllers/collections/collectionController.js
import Collection from '../../models/collections/Collection.js';
import CollectionRecipe from '../../models/collections/CollectionRecipe.js';
import { redisClient } from '../../cache/redis.js';

/**
 * Create a new collection
 * @route POST /api/collections
 */
export const createCollection = async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const collection = await Collection.create({
      userId: req.user.id,
      title,
      description,
      isPublic
    });

    res.status(201).json({
      success: true,
      data: collection,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get collection by ID
 * @route GET /api/collections/:id
 */
export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.json({
      success: true,
      data: collection,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get recipes in a collection
 * @route GET /api/collections/:id/recipes
 */
export const getCollectionRecipes = async (req, res) => {
  try {
    const { id: collectionId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const recipes = await CollectionRecipe.getRecipes(collectionId, limit, offset);

    res.json({
      success: true,
      data: recipes,
      meta: { page, limit, total: recipes.length }
    });
  } catch (error) {
    console.error('Error fetching collection recipes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add recipe to collection
 * @route POST /api/collections/:id/recipes/:recipeId
 */
export const addRecipeToCollection = async (req, res) => {
  try {
    const { id: collectionId, recipeId } = req.params;
    const userId = req.user.id;

    // Verify user owns collection
    const collection = await Collection.findById(collectionId);
    if (!collection || collection.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own collections'
      });
    }

    const result = await CollectionRecipe.addRecipe(collectionId, recipeId);

    res.status(201).json({
      success: true,
      data: result,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error adding recipe to collection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Remove recipe from collection
 * @route DELETE /api/collections/:id/recipes/:recipeId
 */
export const removeRecipeFromCollection = async (req, res) => {
  try {
    const { id: collectionId, recipeId } = req.params;
    const userId = req.user.id;

    // Verify user owns collection
    const collection = await Collection.findById(collectionId);
    if (!collection || collection.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own collections'
      });
    }

    await CollectionRecipe.removeRecipe(collectionId, recipeId);

    res.json({
      success: true,
      data: null,
      meta: { message: 'Recipe removed from collection' }
    });
  } catch (error) {
    console.error('Error removing recipe:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's collections
 * @route GET /api/user/collections
 */
export const getUserCollections = async (req, res) => {
  try {
    const userId = req.user.id;
    let collections = [];
    
    try {
      collections = await Collection.findByUser(userId);
    } catch (dbError) {
      console.warn('Database error fetching user collections:', dbError.message);
      collections = [];
    }

    res.json({
      success: true,
      data: collections,
      meta: { page: 1, limit: 20, total: collections.length }
    });
  } catch (error) {
    console.error('Error fetching user collections:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch collections',
      data: [],
      meta: { page: 1, limit: 20, total: 0 }
    });
  }
};

/**
 * Get public collections (discovery)
 * @route GET /api/collections/public
 */
export const getPublicCollections = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let collections = [];
    try {
      collections = await Collection.findPublic(limit, offset);
    } catch (dbError) {
      console.warn('Database error fetching public collections:', dbError.message);
      collections = [];
    }

    res.json({
      success: true,
      data: collections,
      meta: { page, limit, total: collections.length }
    });
  } catch (error) {
    console.error('Error fetching public collections:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get trending collections
 * @route GET /api/collections/trending
 */
export const getTrendingCollections = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Try cache first
    const cacheKey = 'app:trending:collections';
    const cached = await redisClient.get(cacheKey);

    let collections;
    if (cached) {
      collections = JSON.parse(cached);
    } else {
      collections = await Collection.getTrending(limit);
      // Cache for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(collections));
    }

    res.json({
      success: true,
      data: collections,
      meta: { page: 1, limit, total: collections.length }
    });
  } catch (error) {
    console.error('Error fetching trending collections:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update collection
 * @route PUT /api/collections/:id
 */
export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic } = req.body;
    const userId = req.user.id;

    const collection = await Collection.update(id, userId, {
      title,
      description,
      isPublic
    });

    // Invalidate trending collections cache
    await redisClient.del('app:trending:collections');

    res.json({
      success: true,
      data: collection,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(403).json({ success: false, error: error.message });
  }
};

/**
 * Delete collection
 * @route DELETE /api/collections/:id
 */
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await Collection.delete(id, userId);

    // Invalidate trending collections cache
    await redisClient.del('app:trending:collections');

    res.json({
      success: true,
      data: null,
      meta: { message: 'Collection deleted' }
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(403).json({ success: false, error: error.message });
  }
};
