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
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="glass-panel mb-6 rounded-[32px] p-8 shadow-lg shadow-amber-500/5 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="eyebrow mb-4 text-amber-700 tracking-[0.2em] font-bold text-xs uppercase">Challenges</div>
            <h1 className="font-display text-4xl text-slate-900">Weekly Challenges</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-4 border-b border-white/40">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 border-b-2 font-semibold transition-all ${
              activeTab === 'active'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Challenges
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 border-b-2 font-semibold transition-all ${
              activeTab === 'results'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Challenge Results</h2>
            {selectedChallenge && (
              <Leaderboard 
                challengeId={selectedChallenge}
                onBack={() => setSelectedChallenge(null)}
              />
            )}
            {!selectedChallenge && (
              <div className="text-center py-12">
                <p className="mb-4 text-slate-500 font-medium">Select a challenge to view results</p>
                <button
                  onClick={() => setActiveTab('active')}
                  className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
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
