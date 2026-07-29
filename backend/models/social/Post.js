// backend/models/social/Post.js
import { pool } from '../../config/db.js';
import Follow from './Follow.js';

class Post {
  static schemaCache = null;

  static async getSchemaConfig() {
    if (Post.schemaCache) {
      return Post.schemaCache;
    }

    const result = await pool.query(
      `SELECT table_name, column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND (
           (table_name = 'posts' AND column_name IN ('caption', 'content', 'like_count', 'comment_count')) OR
           (table_name = 'users' AND column_name IN ('name', 'avatar_url'))
         )`
    );

    const columns = new Set(result.rows.map((row) => `${row.table_name}.${row.column_name}`));

    Post.schemaCache = {
      hasPostCaption: columns.has('posts.caption'),
      hasPostContent: columns.has('posts.content'),
      hasLikeCount: columns.has('posts.like_count'),
      hasCommentCount: columns.has('posts.comment_count'),
      hasUserName: columns.has('users.name'),
      hasUserAvatar: columns.has('users.avatar_url')
    };

    return Post.schemaCache;
  }

  /**
   * Create a new post
   * @param {string} userId - User ID
   * @param {string} recipeId - Recipe ID
   * @param {string} caption - Post caption
   * @param {string} imageUrl - Image URL (Cloudinary)
   * @returns {Object} Created post
   */
  static async create({ userId, recipeId, caption, imageUrl }) {
    const schema = await Post.getSchemaConfig();
    const contentColumn = schema.hasPostCaption ? 'caption' : 'content';

    const result = await pool.query(
      `INSERT INTO posts (user_id, recipe_id, ${contentColumn}, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, recipe_id, ${contentColumn} AS caption, image_url, created_at`,
      [userId, recipeId, caption, imageUrl]
    );

    return {
      ...result.rows[0],
      like_count: 0,
      comment_count: 0
    };
  }

  /**
   * Get post by ID with user and recipe details
   * @param {string} postId - Post ID
   * @returns {Object} Post with user and recipe details
   */
  static async findById(postId) {
    const schema = await Post.getSchemaConfig();
    const contentSelect = schema.hasPostCaption
      ? 'p.caption AS caption'
      : schema.hasPostContent
        ? 'p.content AS caption'
        : 'NULL::TEXT AS caption';
    const authorNameSelect = schema.hasUserName
      ? 'u.name AS author_name'
      : "''::TEXT AS author_name";
    const authorAvatarSelect = schema.hasUserAvatar
      ? 'u.avatar_url AS author_avatar'
      : 'NULL::TEXT AS author_avatar';
    const likeCountSelect = schema.hasLikeCount
      ? 'COALESCE(p.like_count, 0) AS like_count'
      : '(SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count';
    const commentCountSelect = schema.hasCommentCount
      ? 'COALESCE(p.comment_count, 0) AS comment_count'
      : '(SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count';

    const result = await pool.query(
      `SELECT 
        p.id, 
        p.user_id, 
        p.recipe_id, 
        ${contentSelect},
        p.image_url, 
        ${likeCountSelect},
        ${commentCountSelect},
        p.created_at,
        ${authorNameSelect},
        ${authorAvatarSelect},
        r.name AS recipe_name,
        r.description AS recipe_description,
        r.image_url AS recipe_image_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN recipes r ON p.recipe_id = r.id
       WHERE p.id = $1`,
      [postId]
    );
    return result.rows[0];
  }

  /**
   * Get all posts by a user
   * @param {string} userId - User ID
   * @param {number} limit - Limit results
   * @param {number} offset - Offset results
   * @returns {Array} Array of posts
   */
  static async findByUserId(userId, limit = 20, offset = 0) {
    const schema = await Post.getSchemaConfig();
    const contentSelect = schema.hasPostCaption
      ? 'p.caption AS caption'
      : schema.hasPostContent
        ? 'p.content AS caption'
        : 'NULL::TEXT AS caption';
    const authorNameSelect = schema.hasUserName
      ? 'u.name AS author_name'
      : "''::TEXT AS author_name";
    const authorAvatarSelect = schema.hasUserAvatar
      ? 'u.avatar_url AS author_avatar'
      : 'NULL::TEXT AS author_avatar';
    const likeCountSelect = schema.hasLikeCount
      ? 'COALESCE(p.like_count, 0) AS like_count'
      : '(SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count';
    const commentCountSelect = schema.hasCommentCount
      ? 'COALESCE(p.comment_count, 0) AS comment_count'
      : '(SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count';

    const result = await pool.query(
      `SELECT 
        p.id, 
        p.user_id, 
        p.recipe_id, 
        ${contentSelect},
        p.image_url, 
        ${likeCountSelect},
        ${commentCountSelect},
        p.created_at,
        ${authorNameSelect},
        ${authorAvatarSelect},
        r.name AS recipe_name,
        r.description AS recipe_description,
        r.image_url AS recipe_image_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN recipes r ON p.recipe_id = r.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getFeed(userId, limit = 10, offset = 0) {
    const schema = await Post.getSchemaConfig();
    const followSchema = await Follow.getSchemaConfig();
    const contentSelect = schema.hasPostCaption
      ? 'p.caption AS caption'
      : schema.hasPostContent
        ? 'p.content AS caption'
        : 'NULL::TEXT AS caption';
    const authorNameSelect = schema.hasUserName
      ? 'u.name AS author_name'
      : "''::TEXT AS author_name";
    const authorAvatarSelect = schema.hasUserAvatar
      ? 'u.avatar_url AS author_avatar'
      : 'NULL::TEXT AS author_avatar';
    const likeCountSelect = schema.hasLikeCount
      ? 'COALESCE(p.like_count, 0) AS like_count'
      : '(SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count';
    const commentCountSelect = schema.hasCommentCount
      ? 'COALESCE(p.comment_count, 0) AS comment_count'
      : '(SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count';

    const result = await pool.query(
      `SELECT
        p.id,
        p.user_id,
        p.recipe_id,
        ${contentSelect},
        p.image_url,
        ${likeCountSelect},
        ${commentCountSelect},
        p.created_at,
        ${authorNameSelect},
        ${authorAvatarSelect},
        r.name AS recipe_name,
        r.description AS recipe_description,
        r.image_url AS recipe_image_url,
        (SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1)) AS is_liked,
        (SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND ${followSchema.followingColumn} = p.user_id)) AS is_following_author
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN recipes r ON p.recipe_id = r.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId || null, limit, offset]
    );

    return result.rows;
  }

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {boolean} Success
   */
  static async delete(postId) {
    const result = await pool.query(
      `DELETE FROM posts WHERE id = $1`,
      [postId]
    );
    return result.rowCount > 0;
  }

  /**
   * Increment like count
   * @param {string} postId - Post ID
   */
  static async incrementLikeCount(postId) {
    const schema = await Post.getSchemaConfig();
    if (!schema.hasLikeCount) return;

    await pool.query(
      `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`,
      [postId]
    );
  }

  /**
   * Decrement like count
   * @param {string} postId - Post ID
   */
  static async decrementLikeCount(postId) {
    const schema = await Post.getSchemaConfig();
    if (!schema.hasLikeCount) return;

    await pool.query(
      `UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = $1`,
      [postId]
    );
  }

  /**
   * Increment comment count
   * @param {string} postId - Post ID
   */
  static async incrementCommentCount(postId) {
    const schema = await Post.getSchemaConfig();
    if (!schema.hasCommentCount) return;

    await pool.query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
      [postId]
    );
  }

  /**
   * Decrement comment count
   * @param {string} postId - Post ID
   */
  static async decrementCommentCount(postId) {
    const schema = await Post.getSchemaConfig();
    if (!schema.hasCommentCount) return;

    await pool.query(
      `UPDATE posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = $1`,
      [postId]
    );
  }
}

export default Post;
