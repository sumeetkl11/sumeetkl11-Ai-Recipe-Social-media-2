// backend/routes/collections/collections.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import {
  createCollection,
  getCollectionById,
  getCollectionRecipes,
  addRecipeToCollection,
  removeRecipeFromCollection,
  getUserCollections,
  getPublicCollections,
  getTrendingCollections,
  updateCollection,
  deleteCollection
} from '../../controllers/collections/collectionController.js';

const router = express.Router();

// Public/Protected hybrid route - returns user collections if authed, else public
router.get('/', async (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }
  next();
}, (req, res) => {
  if (req.user) {
    return getUserCollections(req, res);
  } else {
    return getPublicCollections(req, res);
  }
});

// Public routes
router.get('/public', getPublicCollections);
router.get('/trending', getTrendingCollections);
router.get('/:id', getCollectionById);
router.get('/:id/recipes', getCollectionRecipes);

// Protected routes
router.post('/', authMiddleware, createCollection);
router.put('/:id', authMiddleware, updateCollection);
router.delete('/:id', authMiddleware, deleteCollection);
router.post('/:id/recipes/:recipeId', authMiddleware, addRecipeToCollection);
router.delete('/:id/recipes/:recipeId', authMiddleware, removeRecipeFromCollection);
router.get('/user/collections', authMiddleware, getUserCollections);

export default router;
