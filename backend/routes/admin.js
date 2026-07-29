import express from 'express';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.listUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/posts', adminController.listPosts);
router.delete('/posts/:id', adminController.deletePost);

export default router;
