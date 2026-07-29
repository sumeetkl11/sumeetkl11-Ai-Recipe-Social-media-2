import express from 'express';
import * as shoppingListController from '../controllers/shoppingListController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', shoppingListController.getShoppingList);
router.post('/generate', shoppingListController.generateFromMealPlan);
router.post('/', shoppingListController.addItem);
router.put('/:id/toggle', shoppingListController.toggleChecked);
router.put('/:id', shoppingListController.updateItem);
router.delete('/clear/checked', shoppingListController.clearChecked);
router.delete('/clear/all', shoppingListController.clearAll);
router.delete('/:id', shoppingListController.deleteItem);
router.post('/add-to-pantry', shoppingListController.addCheckedToPantry);

export default router;