// backend/routes/social/posts.js
import express from 'express';
import authMiddleware, { optionalAuthMiddleware } from '../../middleware/auth.js';
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

// Public / Optional Auth routes for viewing feed and posts
router.get('/', optionalAuthMiddleware, paginationValidation, postController.getFeedPosts);
router.get('/:id', optionalAuthMiddleware, uuidParamValidation('id'), postController.getPost);
router.get('/:id/comments', optionalAuthMiddleware, paginationValidation, postController.getPostComments);

// Protected routes (require auth)
router.post('/', authMiddleware, writeLimiter, createPostValidation, postController.createPost);
router.delete('/:id', authMiddleware, uuidParamValidation('id'), postController.deletePost);

// Post comments (creation & deletion)
router.post('/:id/comments', authMiddleware, writeLimiter, createCommentValidation, postController.createComment);
router.delete('/comments/:id', authMiddleware, uuidParamValidation('id'), postController.deleteComment);

// Post likes
router.post('/:id/like', authMiddleware, writeLimiter, uuidParamValidation('id'), likeController.likePost);
router.delete('/:id/like', authMiddleware, uuidParamValidation('id'), likeController.unlikePost);
router.get('/:id/likes', optionalAuthMiddleware, paginationValidation, uuidParamValidation('id'), likeController.getPostLikes);

export default router;
