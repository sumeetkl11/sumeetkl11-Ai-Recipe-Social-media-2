import express from 'express';
import { createPurchase, getPurchaseHistory, getSalesHistory } from '../../controllers/marketplace/purchaseController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createPurchase);
router.get('/history', authMiddleware, getPurchaseHistory);
router.get('/sales', authMiddleware, getSalesHistory);

export default router;
