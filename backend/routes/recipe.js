import express from 'express';
import * as recipeController from '../controllers/recipeController.js';
import authMiddleware from '../middleware/auth.js';


const router = express.Router();

router.use(authMiddleware);

// Ai generated recipes
router.post('/generate', recipeController.generatePantrySuggestions);
router.post('/suggestion', recipeController.getSmartPantrySuggestions);

router.get('/', recipeController.getAllRecipes);
router.get('/recent', recipeController.getRecentRecipes);
router.get('/stats', recipeController.getRecipeStats);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.saveRecipe);
router.put('/:id', recipeController.updateRecipe);
router.delete('/:id', recipeController.deleteRecipe);

export default router;