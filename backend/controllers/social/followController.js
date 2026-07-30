// backend/controllers/social/followController.js
import Follow from '../../models/social/Follow.js';
import Notification from '../../models/social/Notification.js';
import Post from '../../models/social/Post.js';
import Collection from '../../models/collections/Collection.js';
import { pool } from '../../config/db.js';
import { emitNotification } from '../../sockets/socialSocket.js';

/**
 * Follow a user
 * @route POST /api/users/:id/follow
 */
export const followUser = async (req, res) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    // Prevent self-follow
    if (followingId === followerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if target user exists
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [followingId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const alreadyFollowing = await Follow.exists({
      followerId,
      followingId
    });

    if (alreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    const follow = await Follow.create({ followerId, followingId });

    // Update follower/following counts
    await pool.query(
      `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
      [followerId]
    );
    await pool.query(
      `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`,
      [followingId]
    );

    try {
      const notification = await Notification.create({
        userId: followingId,
        actorId: followerId,
        type: 'follow'
      });

      const notificationPayload = await Notification.findById(notification.id);
      if (notificationPayload) {
        emitNotification(req.io, followingId, notificationPayload);
      }
    } catch (notificationError) {
      console.error('Error creating follow notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      data: follow,
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow user'
    });
  }
};

/**
 * Unfollow a user
 * @route DELETE /api/users/:id/follow
 */
export const unfollowUser = async (req, res) => {
  try {
    const { id: followingId } = req.params;
    const followerId = req.user.id;

    // Check if target user exists
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [followingId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const removed = await Follow.delete({ followerId, followingId });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Follow relationship not found'
      });
    }

    // Update follower/following counts
    await pool.query(
      `UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = $1`,
      [followerId]
    );
    await pool.query(
      `UPDATE users SET follower_count = GREATEST(0, follower_count - 1) WHERE id = $1`,
      [followingId]
    );

    res.json({
      success: true,
      data: { followerId, followingId },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user'
    });
  }
};

/**
 * Get followers of a user
 * @route GET /api/users/:id/followers
 */
export const getUserFollowers = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Check if user exists
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followers = await Follow.getFollowers(userId, limit, offset);
    const followSchema = await Follow.getSchemaConfig();
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM follows WHERE ${followSchema.followingColumn} = $1`,
      [userId]
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    res.json({
      success: true,
      data: followers,
      meta: { page, limit, total }
    });
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers'
    });
  }
};

/**
 * Get users followed by a user
 * @route GET /api/users/:id/following
 */
export const getUserFollowing = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Check if user exists
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const following = await Follow.getFollowing(userId, limit, offset);
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM follows WHERE follower_id = $1`,
      [userId]
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    res.json({
      success: true,
      data: following,
      meta: { page, limit, total }
    });
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following'
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id: profileUserId } = req.params;
    const currentUserId = req.user.id;
    const followSchema = await Follow.getSchemaConfig();

    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        COALESCE(NULLIF(u.name, ''), split_part(u.email, '@', 1)) AS username,
        u.bio,
        u.avatar_url,
        COALESCE(u.follower_count, 0) AS followers_count,
        COALESCE(u.following_count, 0) AS following_count,
        (SELECT EXISTS(
          SELECT 1 FROM follows
          WHERE follower_id = $2 AND ${followSchema.followingColumn} = u.id
        )) AS is_following
       FROM users u
       WHERE u.id = $1`,
      [profileUserId, currentUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { id: profileUserId } = req.params;

    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT r.id)::INT AS recipe_count,
        COUNT(DISTINCT p.id)::INT AS post_count,
        0::INT AS current_streak
       FROM users u
       LEFT JOIN recipes r ON r.user_id = u.id
       LEFT JOIN posts p ON p.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [profileUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { id: profileUserId } = req.params;
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const posts = await Post.findByUserId(profileUserId, limit, offset);
    const totalResult = await pool.query('SELECT COUNT(*) AS count FROM posts WHERE user_id = $1', [profileUserId]);

    res.json({
      success: true,
      data: posts,
      meta: { page, limit, total: parseInt(totalResult.rows[0].count, 10) }
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      data: []
    });
  }
};

export const getUserCollections = async (req, res) => {
  try {
    const { id: profileUserId } = req.params;
    const collections = await Collection.findByUser(profileUserId);

    res.json({
      success: true,
      data: collections,
      meta: { page: 1, limit: collections.length, total: collections.length }
    });
  } catch (error) {
    console.error('Error getting user collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collections',
      data: []
    });
  }
};
