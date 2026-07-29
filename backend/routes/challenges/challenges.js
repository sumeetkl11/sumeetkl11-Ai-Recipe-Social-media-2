// backend/routes/challenges/challenges.js
import express from 'express';
import authMiddleware from '../../middleware/auth.js';
import {
  createChallenge,
  getChallengeById,
  getActiveChallenges,
  joinChallenge,
  getChallengeLeaderboard,
  getUserChallenges,
  getChallengeProgress,
  completeRecipeInChallenge
} from '../../controllers/challenges/challengeController.js';

const router = express.Router();

// Public routes
router.get('/', getActiveChallenges);
router.get('/:id', getChallengeById);
router.get('/:id/leaderboard', getChallengeLeaderboard);

// Protected routes
router.post('/', authMiddleware, createChallenge);
router.post('/:id/join', authMiddleware, joinChallenge);
router.get('/:id/progress', authMiddleware, getChallengeProgress);
router.post('/:id/complete-recipe', authMiddleware, completeRecipeInChallenge);
router.get('/user/challenges', authMiddleware, getUserChallenges);

export default router;
