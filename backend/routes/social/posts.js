// backend/routes/social/posts.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import * as postController from '../../controllers/social/postController.js';
import * as likeController from '../../controllers/social/likeController.js';
import { 
    createPostValidation, 
    updatePostValidation, 
    createCommentValidation,
    paginationValidation,
    uuidParamValidation 
} from '../../middleware/validation.js';
import { writeLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

// Protected routes (all require auth)
router.get('/', authMiddleware, paginationValidation, postController.getFeedPosts);
router.post('/', authMiddleware, writeLimiter, createPostValidation, postController.createPost);
router.get('/:id', authMiddleware, uuidParamValidation('id'), postController.getPost);
router.delete('/:id', authMiddleware, uuidParamValidation('id'), postController.deletePost);

// Post comments
router.get('/:id/comments', authMiddleware, paginationValidation, postController.getPostComments);
router.post('/:id/comments', authMiddleware, writeLimiter, createCommentValidation, postController.createComment);
router.delete('/comments/:id', authMiddleware, uuidParamValidation('id'), postController.deleteComment);

// Post likes
router.post('/:id/like', authMiddleware, writeLimiter, uuidParamValidation('id'), likeController.likePost);
router.delete('/:id/like', authMiddleware, uuidParamValidation('id'), likeController.unlikePost);
router.get('/:id/likes', authMiddleware, paginationValidation, uuidParamValidation('id'), likeController.getPostLikes);

export default router;
