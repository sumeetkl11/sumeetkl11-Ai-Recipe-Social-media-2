import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../styles/FollowButton.css';

export default function FollowButton({ userId, isFollowing: initialFollowing = false, onFollowChange, className = '' }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleToggleFollow = useCallback(async () => {
    if (loading) return;

    // Optimistic toggle
    const next = !isFollowing;
    setIsFollowing(next);
    if (onFollowChange) onFollowChange(next);

    try {
      setLoading(true);
      const response = isFollowing
        ? await api.delete(`/users/${userId}/follow`)
        : await api.post(`/users/${userId}/follow`, {});

      const result = response.data;
      const confirmed = !isFollowing;
      setIsFollowing(confirmed);
      if (onFollowChange) onFollowChange(confirmed);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already following')) {
        setIsFollowing(true);
        if (onFollowChange) onFollowChange(true);
        return;
      }
      if (err.response?.status === 404 && isFollowing) {
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(false);
        return;
      }

      // Rollback + notify
      setIsFollowing(isFollowing);
      if (onFollowChange) onFollowChange(isFollowing);
      toast.error(err.response?.data?.message || 'Could not update follow status');
    } finally {
      setLoading(false);
    }
  }, [isFollowing, userId, loading, onFollowChange]);

  return (
    <button
      className={`follow-btn ${isFollowing ? 'following' : ''} ${className}`}
      onClick={handleToggleFollow}
      disabled={loading}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? `Unfollow this user` : `Follow this user`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
