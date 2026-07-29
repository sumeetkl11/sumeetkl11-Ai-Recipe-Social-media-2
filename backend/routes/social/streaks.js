// backend/routes/social/streaks.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import * as streakController from '../../controllers/social/streakController.js';

const router = express.Router();

// Protected routes
router.get('/:id/streak', authMiddleware, streakController.getUserStreak);
router.post('/streak/cook', authMiddleware, streakController.recordCookEvent);

// Public leaderboard
router.get('/leaderboard/streaks', streakController.getStreakLeaderboard);
router.get('/feed/activity', authMiddleware, streakController.getActivityFeed);

export default router;
