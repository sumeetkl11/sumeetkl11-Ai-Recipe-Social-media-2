// frontend/src/components/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

export default function Leaderboard({ challengeId, onBack }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (challengeId) {
      fetchLeaderboard();
    }
  }, [challengeId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/challenges/${challengeId}/leaderboard`);
      setEntries(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-semibold"
        >
          <ChevronLeft size={20} /> Back
        </button>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No entries yet for this challenge</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg p-4 shadow-sm border-l-4"
              style={{
                borderLeftColor:
                  idx === 0 ? '#fbbf24' : idx === 1 ? '#d1d5db' : idx === 2 ? '#f97316' : '#e5e7eb'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold w-12 text-center">
                    {getMedalEmoji(idx + 1)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{entry.user_name}</h3>
                    <p className="text-sm text-gray-600">{entry.recipe_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{entry.vote_count}</div>
                  <div className="text-xs text-gray-500">votes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
