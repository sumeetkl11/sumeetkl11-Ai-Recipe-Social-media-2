// frontend/src/pages/CollectionDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CollectionDetailPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [availableRecipes, setAvailableRecipes] = useState([]);

  useEffect(() => {
    fetchCollectionDetails();
    fetchAvailableRecipes();
  }, [collectionId]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/collections/${collectionId}`);
      setCollection(response.data.data);
      setRecipes(response.data.data.recipes || []);
    } catch (err) {
      toast.error('Failed to load collection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      setAvailableRecipes(response.data.data?.recipes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecipe = async () => {
    if (!selectedRecipe) {
      toast.error('Please select a recipe');
      return;
    }

    try {
      await api.post(`/collections/${collectionId}/recipes`, { recipeId: selectedRecipe });
      toast.success('Recipe added to collection!');
      setSelectedRecipe('');
      setShowAddRecipe(false);
      fetchCollectionDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add recipe');
    }
  };

  const handleRemoveRecipe = async (recipeId) => {
    try {
      await api.delete(`/collections/${collectionId}/recipes/${recipeId}`);
      toast.success('Recipe removed from collection!');
      fetchCollectionDetails();
    } catch (err) {
      toast.error('Failed to remove recipe');
    }
  };

  if (loading) {
    return (
      <div className="page-bg min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
          <div className="h-32 rounded-3xl bg-white/40 border border-white/60 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        {/* Decorative blobs behind main container */}
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-semibold text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ChevronLeft size={20} /> Back
          </button>
          <div>
            <h1 className="font-display text-4xl text-slate-900">{collection?.name}</h1>
            <p className="mt-2 text-slate-500 font-medium">{recipes.length} recipes</p>
          </div>
        </div>

        {/* Add Recipe Form */}
        {!showAddRecipe ? (
          <button
            onClick={() => setShowAddRecipe(true)}
            className="cta-button mb-8"
          >
            <Plus size={20} /> Add Recipe
          </button>
        ) : (
          <div className="glass-panel mb-8 p-6 rounded-[32px] shadow-sm">
            <div className="flex gap-4">
              <select
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
                className="flex-1 rounded-2xl border border-white/60 bg-white/50 px-5 py-3.5 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 backdrop-blur-sm transition-all"
              >
                <option value="">Select a recipe...</option>
                {availableRecipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddRecipe}
                className="cta-button"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddRecipe(false)}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="glass-card text-center py-12 bg-white/40 border-white/60 backdrop-blur-md">
            <p className="text-slate-500 font-medium">No recipes in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <div
                key={recipe.id}
                className="glass-card overflow-hidden bg-white/40 border-white/60 backdrop-blur-md transition-all hover:bg-white/60 hover:-translate-y-1 hover:shadow-lg shadow-amber-500/5 group"
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="p-4">
                  <h3 className="mb-2 font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{recipe.name}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-500 font-medium">
                    {recipe.description}
                  </p>
                  <button
                    onClick={() => handleRemoveRecipe(recipe.id)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50/80 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
