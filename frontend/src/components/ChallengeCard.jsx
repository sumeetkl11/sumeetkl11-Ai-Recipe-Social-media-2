// frontend/src/components/ChallengeCard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../services/api';
import '../styles/ChallengeCard.css';

export default function ChallengeCard({ challenge, onJoin }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleJoin = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        buildApiUrl(`/challenges/${challenge.id}/join`),
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        onJoin?.(challenge.id);
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = Math.ceil(
    (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="challenge-card">
      {challenge.image_url && (
        <img src={challenge.image_url} alt={challenge.title} className="challenge-image" />
      )}
      <div className="challenge-content">
        <h3>{challenge.title}</h3>
        <p className="challenge-description">{challenge.description}</p>
        <div className="challenge-meta">
          <span className="participants">{challenge.participant_count} participants</span>
          <span className={`days-remaining ${daysRemaining <= 3 ? 'urgent' : ''}`}>
            {daysRemaining} days left
          </span>
        </div>
        <button
          onClick={handleJoin}
          disabled={loading}
          className="join-btn"
        >
          {loading ? 'Joining...' : 'Join Challenge'}
        </button>
      </div>
    </div>
  );
}
