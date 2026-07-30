// backend/controllers/challenges/challengeController.js
import Challenge from '../../models/challenges/Challenge.js';
import ChallengeEntry from '../../models/challenges/ChallengeEntry.js';
import { redisClient } from '../../cache/redis.js';

/**
 * Create a new challenge (admin/creator only)
 * @route POST /api/challenges
 */
export const createChallenge = async (req, res) => {
  try {
    const { title, description, imageUrl, startDate, endDate, recipeIds } = req.body;
    
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, startDate, and endDate are required'
      });
    }

    const challenge = await Challenge.create({
      title,
      description,
      imageUrl,
      startDate,
      endDate,
      recipeIds,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: challenge,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get challenge by ID
 * @route GET /api/challenges/:id
 */
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      data: challenge,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all active challenges
 * @route GET /api/challenges
 */
export const getActiveChallenges = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let challenges = [];
    try {
      challenges = await Challenge.findActive(limit, offset);
    } catch (dbError) {
      console.warn('Database error fetching challenges:', dbError.message);
      // Return empty array on error
      challenges = [];
    }

    res.json({
      success: true,
      data: challenges,
      meta: { page, limit, total: challenges.length }
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch challenges',
      data: [],
      meta: { page: 1, limit: 20, total: 0 }
    });
  }
};

/**
 * Join a challenge
 * @route POST /api/challenges/:id/join
 */
export const joinChallenge = async (req, res) => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user.id;

    // Get or create entry
    const entry = await ChallengeEntry.getOrCreate(challengeId, userId);

    // Update challenge participant count
    await Challenge.updateParticipantCount(challengeId);

    res.status(201).json({
      success: true,
      data: entry,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get challenge leaderboard
 * @route GET /api/challenges/:id/leaderboard
 */
export const getChallengeLeaderboard = async (req, res) => {
  try {
    const { id: challengeId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    // Try cache first
    const cacheKey = `app:leaderboard:challenge:${challengeId}`;
    const cached = await redisClient.get(cacheKey);

    let leaderboard;
    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      leaderboard = await Challenge.getLeaderboard(challengeId, limit);
      // Cache for 1 hour
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(leaderboard));
    }

    res.json({
      success: true,
      data: leaderboard,
      meta: { page: 1, limit, total: leaderboard.length }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's challenges
 * @route GET /api/user/challenges
 */
export const getUserChallenges = async (req, res) => {
  try {
    const userId = req.user.id;
    const challenges = await ChallengeEntry.findByUser(userId);

    res.json({
      success: true,
      data: challenges,
      meta: { page: 1, limit: 20, total: challenges.length }
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's progress in a specific challenge
 * @route GET /api/challenges/:id/progress
 */
export const getChallengeProgress = async (req, res) => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user.id;

    const entry = await ChallengeEntry.findByUserAndChallenge(challengeId, userId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'User not participating in this challenge'
      });
    }

    res.json({
      success: true,
      data: entry,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Record recipe completion in challenge
 * @route POST /api/challenges/:id/complete-recipe
 */
export const completeRecipeInChallenge = async (req, res) => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user.id;

    // Increment recipes completed
    const updated = await ChallengeEntry.incrementRecipes(challengeId, userId);

    // Invalidate leaderboard cache
    await redisClient.del(`app:leaderboard:challenge:${challengeId}`);

    res.json({
      success: true,
      data: updated,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error completing recipe:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
