// frontend/src/pages/CollectionsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CollectionsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchCollections();
  }, [userId]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const endpoint = userId ? `/collections?userId=${userId}` : '/collections';
      const response = await api.get(endpoint);
      setCollections(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load collections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      setIsCreating(true);
      await api.post('/collections', { name: newCollectionName });
      toast.success('Collection created!');
      setNewCollectionName('');
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/social')}
            className="flex items-center gap-2 font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <h1 className="font-display text-4xl text-slate-900">Collections</h1>
        </div>

        {/* Create Collection Form */}
        <div className="glass-panel mb-8 p-6 rounded-[32px] shadow-sm">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="New collection name..."
              className="flex-1 rounded-2xl border border-white/60 bg-white/50 px-5 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 backdrop-blur-sm transition-all"
            />
            <button
              onClick={handleCreateCollection}
              disabled={isCreating}
              className="cta-button disabled:opacity-50"
            >
              <Plus size={20} /> Create
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/40 animate-pulse border border-white/60" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="glass-card text-center py-12 bg-white/40 border-white/60 backdrop-blur-md">
            <p className="mb-4 text-slate-500 font-medium">No collections yet</p>
            <p className="text-sm text-slate-400">Start by creating your first collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <div
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`)}
                className="glass-card cursor-pointer p-6 bg-white/40 border-white/60 backdrop-blur-md transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-lg shadow-amber-500/5 group"
              >
                <h3 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{collection.name}</h3>
                <p className="mb-4 text-sm text-slate-500 font-medium">
                  {collection.recipe_count || 0} recipes
                </p>
                <div className="flex gap-2 flex-wrap">
                  {collection.tags?.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white/60 border border-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
