import express from 'express';
import { createListing, getListings, getListing } from '../../controllers/marketplace/listingController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', authMiddleware, createListing);

export default router;
