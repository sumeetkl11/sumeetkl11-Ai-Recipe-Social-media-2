// frontend/src/pages/ChallengesPage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ChallengeCard from '../components/ChallengeCard';
import Leaderboard from '../components/Leaderboard';
import Navbar from '../components/Navbar';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'results'
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/challenges');
      setChallenges(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load challenges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="glass-panel mb-6 rounded-[32px] p-8">
          <div className="eyebrow mb-4">Challenges</div>
          <h1 className="font-display text-4xl text-white">Weekly Challenges</h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 border-b-2 font-semibold transition ${
              activeTab === 'active'
                ? 'border-amber-300 text-amber-200'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Active Challenges
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-2 border-b-2 font-semibold transition ${
              activeTab === 'results'
                ? 'border-amber-300 text-amber-200'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Results
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-white/8 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'active' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.filter(c => new Date(c.end_date) > new Date()).map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onJoin={() => {
                  setSelectedChallenge(challenge.id);
                  fetchChallenges();
                }}
              />
            ))}
          </div>
        ) : (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Challenge Results</h2>
            {selectedChallenge && (
              <Leaderboard 
                challengeId={selectedChallenge}
                onBack={() => setSelectedChallenge(null)}
              />
            )}
            {!selectedChallenge && (
              <div className="text-center py-12">
                <p className="mb-4 text-slate-300">Select a challenge to view results</p>
                <button
                  onClick={() => setActiveTab('active')}
                  className="font-semibold text-amber-200 hover:text-amber-100"
                >
                  ← Back to Active Challenges
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
