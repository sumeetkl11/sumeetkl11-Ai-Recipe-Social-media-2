import { pool } from '../config/db.js';
import User from '../models/User.js';
import Post from '../models/social/Post.js';

export const getDashboard = async (req, res) => {
  try {
    const [users, posts, recipes, notifications] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM posts'),
      pool.query('SELECT COUNT(*)::int AS count FROM recipes'),
      pool.query('SELECT COUNT(*)::int AS count FROM notifications')
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows[0].count,
        posts: posts.rows[0].count,
        recipes: recipes.rows[0].count,
        notifications: notifications.rows[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard'
    });
  }
};

export const listUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, email, name, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalResult = await pool.query('SELECT COUNT(*)::int AS count FROM users');

    res.json({
      success: true,
      data: result.rows,
      meta: {
        page,
        limit,
        total: totalResult.rows[0].count
      }
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.delete(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

export const listPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;

    const posts = await Post.getFeed(req.user?.id, limit, offset);
    const totalResult = await pool.query('SELECT COUNT(*)::int AS count FROM posts');

    res.json({
      success: true,
      data: posts,
      meta: {
        page,
        limit,
        total: totalResult.rows[0].count
      }
    });
  } catch (error) {
    console.error('Error listing posts for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await Post.delete(id);

    res.json({
      success: true,
      message: 'Post deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting post as admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};
