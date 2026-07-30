// backend/controllers/social/likeController.js
import Like from '../../models/social/Like.js';
import Post from '../../models/social/Post.js';
import Notification from '../../models/social/Notification.js';
import { pool } from '../../config/db.js';
import { emitNotification } from '../../sockets/socialSocket.js';

/**
 * Like a post
 * @route POST /api/posts/:id/like
 */
export const likePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const postResult = await pool.query(
      `SELECT user_id FROM posts WHERE id = $1`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const alreadyLiked = await Like.exists({ postId, userId });
    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: 'You already liked this post'
      });
    }

    const like = await Like.create({ postId, userId });
    await Post.incrementLikeCount(postId);
    const post = await Post.findById(postId);

    // Create notification for post owner (if not own post)
    const postOwnerId = postResult.rows[0].user_id;
    if (postOwnerId !== userId) {
      // Check if notification already exists (avoid duplicate in last 24hr)
      const notifExists = await Notification.exists({
        userId: postOwnerId,
        actorId: userId,
        type: 'like',
        postId
      });

      if (!notifExists) {
        try {
          const notification = await Notification.create({
            userId: postOwnerId,
            actorId: userId,
            type: 'like',
            postId
          });

          const notificationPayload = await Notification.findById(notification.id);
          if (notificationPayload) {
            emitNotification(req.io, postOwnerId, notificationPayload);
          }
        } catch (notificationError) {
          console.error('Error creating like notification:', notificationError);
        }
      }
    }

    req.io?.emit('feed:like_updated', {
      postId,
      likeCount: post?.like_count ?? undefined,
      actorId: userId,
      action: 'liked'
    });

    res.status(201).json({
      success: true,
      data: {
        like,
        postId,
        like_count: post?.like_count ?? 0,
        is_liked: true
      },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post'
    });
  }
};

/**
 * Unlike a post
 * @route DELETE /api/posts/:id/like
 */
export const unlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const postResult = await pool.query(
      `SELECT id FROM posts WHERE id = $1`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const removed = await Like.delete({ postId, userId });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Like not found'
      });
    }

    await Post.decrementLikeCount(postId);
    const post = await Post.findById(postId);

    req.io?.emit('feed:like_updated', {
      postId,
      likeCount: post?.like_count ?? undefined,
      actorId: userId,
      action: 'unliked'
    });

    res.json({
      success: true,
      data: {
        postId,
        userId,
        like_count: post?.like_count ?? 0,
        is_liked: false
      },
      meta: { page: 1, limit: 1, total: 1 }
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike post'
    });
  }
};

/**
 * Get all likes for a post
 * @route GET /api/posts/:id/likes
 */
export const getPostLikes = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Verify post exists
    const postResult = await pool.query(
      `SELECT id FROM posts WHERE id = $1`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likes = await Like.findByPostId(postId);
    const totalResult = await pool.query(
      `SELECT COUNT(*) as count FROM likes WHERE post_id = $1`,
      [postId]
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    // Paginate manually
    const paginatedLikes = likes.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedLikes,
      meta: { page, limit, total }
    });
  } catch (error) {
    console.error('Error getting likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch likes'
    });
  }
};
