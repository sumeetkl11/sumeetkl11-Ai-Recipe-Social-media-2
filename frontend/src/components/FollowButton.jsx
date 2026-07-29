// frontend/ai-recipe-generator-ui-boilerplate-code/src/components/FollowButton.jsx
import React, { useState, useCallback, useEffect } from 'react';
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

    try {
      setLoading(true);
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(
        buildApiUrl(`/users/${userId}/follow`),
        {
          method,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = await response.json().catch(() => null);

      if (response.ok || (response.status === 400 && result?.message?.includes('already following'))) {
        const nextFollowing = !isFollowing || response.status === 400;
        setIsFollowing(nextFollowing);
        if (onFollowChange) {
          onFollowChange(nextFollowing);
        }
        return;
      }

      if (response.status === 404 && isFollowing) {
        setIsFollowing(false);
        if (onFollowChange) {
          onFollowChange(false);
        }
        return;
      }

      window.alert(result?.message || 'Failed to update follow status');
    } catch (err) {
      console.error('Error toggling follow:', err);
      window.alert('Error updating follow status');
    } finally {
      setLoading(false);
    }
  }, [isFollowing, userId, token, loading, onFollowChange]);

  return (
    <button
      className={`follow-btn ${isFollowing ? 'following' : ''} ${className}`}
      onClick={handleToggleFollow}
      disabled={loading}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
