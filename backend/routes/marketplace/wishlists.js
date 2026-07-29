import express from 'express';
import { getWishlists, createWishlist, getWishlistItems, addWishlistItem } from '../../controllers/marketplace/wishlistController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getWishlists);
router.post('/', authMiddleware, createWishlist);
router.get('/:id/items', authMiddleware, getWishlistItems);
router.post('/:id/items', authMiddleware, addWishlistItem);

export default router;
