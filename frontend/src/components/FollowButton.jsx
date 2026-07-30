import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { buildApiUrl } from '../services/api';
import '../styles/FollowButton.css';

export default function FollowButton({ userId, isFollowing: initialFollowing = false, onFollowChange, className = '' }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

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
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(buildApiUrl(`/users/${userId}/follow`), {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json().catch(() => null);

      if (response.ok || (response.status === 400 && result?.message?.includes('already following'))) {
        const confirmed = !isFollowing || response.status === 400;
        setIsFollowing(confirmed);
        if (onFollowChange) onFollowChange(confirmed);
        return;
      }

      if (response.status === 404 && isFollowing) {
        setIsFollowing(false);
        if (onFollowChange) onFollowChange(false);
        return;
      }

      // Rollback + notify
      setIsFollowing(isFollowing);
      if (onFollowChange) onFollowChange(isFollowing);
      toast.error(result?.message || 'Could not update follow status');
    } catch {
      setIsFollowing(isFollowing);
      if (onFollowChange) onFollowChange(isFollowing);
      toast.error('Could not update follow status — check your connection');
    } finally {
      setLoading(false);
    }
  }, [isFollowing, userId, token, loading, onFollowChange]);

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
