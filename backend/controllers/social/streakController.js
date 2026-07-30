// backend/controllers/social/streakController.js
import Streak from '../../models/social/Streak.js';
import ActivityFeed from '../../models/social/ActivityFeed.js';
import { redisClient } from '../../cache/redis.js';

/**
 * Get user's cooking streak
 * @route GET /api/users/:id/streak
 */
export const getUserStreak = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const streak = await Streak.getOrCreate(userId);

    res.json({
      success: true,
      data: streak,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error getting streak:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch streak'
    });
  }
};

/**
 * Get top streaks leaderboard
 * @route GET /api/leaderboard/streaks
 */
export const getStreakLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Try cache first
    const cacheKey = 'app:leaderboard:streaks';
    const cached = await redisClient.get(cacheKey);
    
    let leaderboard;
    if (cached) {
      leaderboard = JSON.parse(cached);
    } else {
      leaderboard = await Streak.getTopStreaks(limit);
      // Cache for 1 hour
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(leaderboard));
    }

    res.json({
      success: true,
      data: leaderboard,
      meta: { page: 1, limit, total: leaderboard.length }
    });
  } catch (error) {
    console.error('Error getting streak leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

/**
 * Record a cooking event (updates streak)
 * Called when user cooks a recipe
 * @route POST /api/users/streak/cook
 */
export const recordCookEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;

    // Update streak
    const streak = await Streak.updateOnCook(userId);

    // Record in activity feed
    await ActivityFeed.create({
      userId,
      actionType: 'cooked',
      recipeId,
      additionalData: { streak: streak.current_streak }
    });

    // Invalidate leaderboard cache
    await redisClient.del('app:leaderboard:streaks');

    // Emit to followers
    if (global.io) {
      global.io.to(`activity:${userId}:followers`).emit('activity:cook', {
        userId,
        streak: streak.current_streak,
        recipeId
      });
    }

    res.json({
      success: true,
      data: streak,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error recording cook event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record cook event'
    });
  }
};

/**
 * Get activity feed
 * @route GET /api/feed/activity
 */
export const getActivityFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Get following user IDs
    const followingResult = await pool.query(
      `SELECT followed_user_id FROM follows WHERE follower_id = $1`,
      [userId]
    );

    if (followingResult.rows.length === 0) {
      return res.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0 }
      });
    }

    const followingIds = followingResult.rows.map((row) => row.followed_user_id);

    // Get activity from followed users
    const activity = await ActivityFeed.getFollowingActivity(followingIds, limit, offset);

    res.json({
      success: true,
      data: activity,
      meta: { page, limit, total: activity.length }
    });
  } catch (error) {
    console.error('Error getting activity feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity feed'
    });
  }
};
