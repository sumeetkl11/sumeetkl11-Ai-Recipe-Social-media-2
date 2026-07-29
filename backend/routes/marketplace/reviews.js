import express from 'express';
import { addReview, getReviews } from '../../controllers/marketplace/reviewController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authMiddleware, addReview);

export default router;
