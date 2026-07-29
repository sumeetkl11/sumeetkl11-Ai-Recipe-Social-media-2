// backend/routes/social/followers.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import * as followController from '../../controllers/social/followController.js';

const router = express.Router();

// Protected routes (all require auth)
router.post('/:id/follow', authMiddleware, followController.followUser);
router.delete('/:id/follow', authMiddleware, followController.unfollowUser);
router.get('/:id/profile', authMiddleware, followController.getUserProfile);
router.get('/:id/stats', authMiddleware, followController.getUserStats);
router.get('/:id/posts', authMiddleware, followController.getUserPosts);
router.get('/:id/collections', authMiddleware, followController.getUserCollections);
router.get('/:id/followers', authMiddleware, followController.getUserFollowers);
router.get('/:id/following', authMiddleware, followController.getUserFollowing);

export default router;
