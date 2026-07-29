// backend/routes/social/posts.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import * as postController from '../../controllers/social/postController.js';
import * as likeController from '../../controllers/social/likeController.js';

const router = express.Router();

// Protected routes (all require auth)
router.get('/', authMiddleware, postController.getFeedPosts);
router.post('/', authMiddleware, postController.createPost);
router.get('/:id', authMiddleware, postController.getPost);
router.delete('/:id', authMiddleware, postController.deletePost);

// Post comments
router.get('/:id/comments', authMiddleware, postController.getPostComments);
router.post('/:id/comments', authMiddleware, postController.createComment);
router.delete('/comments/:id', authMiddleware, postController.deleteComment);

// Post likes
router.post('/:id/like', authMiddleware, likeController.likePost);
router.delete('/:id/like', authMiddleware, likeController.unlikePost);
router.get('/:id/likes', authMiddleware, likeController.getPostLikes);

export default router;
