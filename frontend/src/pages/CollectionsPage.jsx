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
      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/social')}
            className="flex items-center gap-2 font-semibold text-amber-200 hover:text-amber-100"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <h1 className="font-display text-4xl text-white">Collections</h1>
        </div>

        {/* Create Collection Form */}
        <div className="glass-card mb-8 p-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="New collection name..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white placeholder:text-slate-500 outline-none"
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
              <div key={i} className="h-64 rounded-lg bg-white/8 animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="glass-card text-center py-12">
            <p className="mb-4 text-slate-300">No collections yet</p>
            <p className="text-sm text-slate-500">Start by creating your first collection!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <div
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`)}
                className="glass-card cursor-pointer p-6"
              >
                <h3 className="mb-2 text-xl font-bold text-white">{collection.name}</h3>
                <p className="mb-4 text-sm text-slate-400">
                  {collection.recipe_count || 0} recipes
                </p>
                <div className="flex gap-2 flex-wrap">
                  {collection.tags?.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300"
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
