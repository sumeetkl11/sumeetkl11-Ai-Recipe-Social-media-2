import { memo, useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ChefHat, Clock3, Heart, MessageCircle, Send, Trash2, Utensils } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { buildApiUrl } from '../services/api';
import { getSocket } from '../services/socket';
import FollowButton from './FollowButton';
import MessageUserButton from './MessageUserButton';
import UserAvatar from './UserAvatar';

const formatTime = (value) => new Date(value).toLocaleString();

function PostCard({ post, priority = false, onDeleted, onUpdated }) {
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(Boolean(post.is_liked));
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [commentCount, setCommentCount] = useState(post.comment_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setLiked(Boolean(post.is_liked));
    setLikeCount(post.like_count || 0);
    setCommentCount(post.comment_count || 0);
  }, [post.is_liked, post.like_count, post.comment_count]);

  useEffect(() => {
    if (!showComments || comments.length > 0) {
      return;
    }

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await fetch(buildApiUrl(`/posts/${post.id}/comments`), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setComments(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [showComments, comments.length, post.id, token]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return undefined;
    }

    const handleCommentCreated = ({ postId, comment, commentCount: nextCount }) => {
      if (postId !== post.id) {
        return;
      }

      if (showComments && comment) {
        setComments((current) => {
          if (current.some((item) => item.id === comment.id)) {
            return current;
          }
          return [...current, comment];
        });
      }

      if (typeof nextCount === 'number') {
        setCommentCount(nextCount);
      }
    };

    const handleCommentDeleted = ({ postId, commentId, commentCount: nextCount }) => {
      if (postId !== post.id) {
        return;
      }

      setComments((current) => current.filter((comment) => comment.id !== commentId));
      if (typeof nextCount === 'number') {
        setCommentCount(nextCount);
      }
    };

    const handleLikeUpdated = ({ postId, likeCount: nextCount, actorId, action }) => {
      if (postId !== post.id) {
        return;
      }

      if (typeof nextCount === 'number') {
        setLikeCount(nextCount);
      }

      if (actorId === user?.id) {
        setLiked(action === 'liked');
      }
    };

    socket.on('feed:comment_created', handleCommentCreated);
    socket.on('feed:comment_deleted', handleCommentDeleted);
    socket.on('feed:like_updated', handleLikeUpdated);

    return () => {
      socket.off('feed:comment_created', handleCommentCreated);
      socket.off('feed:comment_deleted', handleCommentDeleted);
      socket.off('feed:like_updated', handleLikeUpdated);
    };
  }, [post.id, showComments, user?.id]);

  const handleLike = async () => {
    if (loading) {
      return;
    }

    const method = liked ? 'DELETE' : 'POST';

    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/posts/${post.id}/like`), {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const result = await response.json();
      const nextLiked = Boolean(result.data?.is_liked);
      const nextLikeCount = result.data?.like_count ?? likeCount;

      setLiked(nextLiked);
      setLikeCount(nextLikeCount);
      onUpdated({
        id: post.id,
        is_liked: nextLiked,
        like_count: nextLikeCount
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/posts/${post.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        onDeleted(post.id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/posts/${post.id}/comments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        const comment = result.data?.comment;
        const nextCommentCount = result.data?.comment_count ?? commentCount;

        setComments((current) => {
          if (!comment || current.some((item) => item.id === comment.id)) {
            return current;
          }
          return [...current, comment];
        });
        setCommentCount(nextCommentCount);
        setNewComment('');
        setShowComments(true);
        onUpdated({
          id: post.id,
          comment_count: nextCommentCount
        });
      } else {
        window.alert(result?.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      window.alert('Error adding comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(buildApiUrl(`/posts/comments/${commentId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        const nextCommentCount = result.data?.comment_count ?? Math.max(0, commentCount - 1);

        setComments((current) => current.filter((comment) => comment.id !== commentId));
        setCommentCount(nextCommentCount);
        onUpdated({
          id: post.id,
          comment_count: nextCommentCount
        });
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const authorName = post.author_name || 'Cook';
  const postImage = post.image_url || post.recipe_image_url;
  const recipeName = post.recipe_name || 'Photo post';
  const recipeDescription = post.recipe_description || post.description;
  return (
    <article className="glass-card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-white/8 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={authorName}
            src={post.author_avatar}
            size={44}
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full object-cover ring-2 ring-amber-200/20"
            textClassName="text-sm font-bold text-slate-950"
          />
          <div className="min-w-0">
            <Link to={`/profile/${post.user_id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-fuchsia-600">
              {authorName}
            </Link>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
              <ChefHat className="h-3.5 w-3.5" />
              {recipeName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user?.id !== post.user_id && (
            <>
              <MessageUserButton
                userId={post.user_id}
                iconOnly
                label="Message user"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/85 px-3 py-2 text-slate-700 transition hover:bg-white hover:text-slate-950"
              />
              <FollowButton
                userId={post.user_id}
                isFollowing={Boolean(post.is_following_author)}
                className="shrink-0"
              />
            </>
          )}

          {user?.id === post.user_id && (
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/8 px-3 py-2 text-rose-200 transition hover:bg-rose-500/14"
              onClick={handleDeletePost}
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {postImage ? (
        <div className="bg-slate-950">
          <img
            src={postImage}
            alt={recipeName}
            className="aspect-square w-full object-cover sm:aspect-[4/5]"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </div>
      ) : (
        <div className="flex aspect-square items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.88))] px-8 text-center sm:aspect-[4/5]">
          <div>
            <Utensils className="mx-auto h-12 w-12 text-amber-200" />
            <p className="mt-4 font-display text-3xl text-white">{recipeName}</p>
            {recipeDescription && (
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">{recipeDescription}</p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className={`transition ${
                liked ? 'text-rose-300' : 'text-slate-500 hover:text-slate-900'
              }`}
              onClick={handleLike}
              disabled={loading}
              aria-label={liked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button
              className="text-slate-500 transition hover:text-slate-900"
              onClick={() => setShowComments((current) => !current)}
              aria-label="Show comments"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          </div>
          <Bookmark className="h-6 w-6 text-slate-400" />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-slate-900">{likeCount} likes</p>

          <div className="rounded-3xl border border-white/8 bg-white/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{recipeName}</span>
              {post.recipe_name && (
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                  Recipe
                </span>
              )}
            </div>
            {post.caption && (
              <p className="mt-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-900">{authorName}</span> {post.caption}
              </p>
            )}
            {recipeDescription && (
              <p className="mt-3 text-sm leading-6 text-slate-600">{recipeDescription}</p>
            )}
          </div>

          <button
            className="text-sm text-slate-500 transition hover:text-slate-900"
            onClick={() => setShowComments((current) => !current)}
          >
            {commentCount > 0 ? `View all ${commentCount} comments` : 'Be the first to comment'}
          </button>

          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            {formatTime(post.created_at)}
          </p>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-white/8 bg-white/70 px-4 py-4 sm:px-5">
          <div className="space-y-3">
            {commentsLoading ? (
              <p className="text-sm text-slate-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-white/8 bg-white/85 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{comment.author_name || comment.user_name || 'Cook'}</p>
                      <p className="mt-1 text-sm text-slate-700">{comment.content}</p>
                    </div>
                    {comment.user_id === user?.id && (
                      <button
                        className="text-rose-300 transition hover:text-rose-200"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddComment();
                }
              }}
              className="flex-1 rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-300/40"
            />
            <button className="cta-button" onClick={handleAddComment} disabled={loading}>
              <Send className="h-4 w-4" />
              Post
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default memo(PostCard);
