import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChefHat, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import useRevalidateOnFocus from '../hooks/useRevalidateOnFocus';

const cuisines = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const difficulties = ['All', 'easy', 'medium', 'hard'];

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let filtered = recipes;

    if (searchQuery) {
      filtered = filtered.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCuisine !== 'All') {
      filtered = filtered.filter((recipe) => recipe.cuisine_type === selectedCuisine);
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter((recipe) => recipe.difficulty === selectedDifficulty);
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, selectedCuisine, selectedDifficulty]);

  const fetchRecipes = useCallback(async (options = {}) => {
    const silent = options.silent && recipes.length > 0;
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await api.get('/recipes');
      setRecipes(response.data.data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [recipes.length]);

  useRevalidateOnFocus(() => fetchRecipes({ silent: true }));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      await api.delete(`/recipes/${id}`);
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    } catch (error) {
      toast.error('Failed to delete recipe');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-bg flex min-h-screen items-center justify-center">
          <div className="glass-panel loading-skeleton h-56 w-full rounded-[32px]" />
        </div>
      </>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="mx-auto px-4 pb-12 pt-8 sm:px-6">
        <div className="page-hero glass-panel mb-6 rounded-[32px] p-8">
          <div className="eyebrow mb-4">
            <Sparkles className="h-4 w-4" />
            Saved Collection
          </div>
          {refreshing && (
            <div className="glass-badge mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Syncing recipes
            </div>
          )}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-slate-950 md:text-5xl">My Recipes</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Every new account gets a starter library, and every recipe you keep lives here in a cleaner, richer browsing experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MetricPill label="Visible" value={filteredRecipes.length} />
              <MetricPill label="Saved" value={recipes.length} />
              <MetricPill label="Styles" value={new Set(recipes.map((recipe) => recipe.cuisine_type).filter(Boolean)).size} />
            </div>
          </div>
        </div>

        <div className="glass-card mb-6 p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search recipes..."
                className="ghost-input w-full px-12 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
            </div>

            <select
              value={selectedCuisine}
              onChange={(event) => setSelectedCuisine(event.target.value)}
              className="ghost-input rounded-2xl px-4 py-3 text-slate-900 outline-none transition"
            >
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine === 'All' ? 'All Cuisines' : cuisine}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(event) => setSelectedDifficulty(event.target.value)}
              className="ghost-input rounded-2xl px-4 py-3 text-slate-900 outline-none transition"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'All' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Showing {filteredRecipes.length} of {recipes.length} recipes
          </p>
        </div>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-[32px] p-12 text-center">
            <ChefHat className="mx-auto mb-4 h-16 w-16 text-slate-500" />
            <p className="mb-4 text-slate-600">
              {recipes.length === 0 ? 'No recipes yet' : 'No recipes match your filters'}
            </p>
            {recipes.length === 0 && (
              <Link to="/generate" className="cta-button inline-flex">
                Generate Your First Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onDelete }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="group overflow-hidden rounded-[28px] border border-white/10  shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_80px_rgba(245,158,11,0.12)]">
      <div className="relative h-56 overflow-hidden">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-amber-200/30 via-orange-400/20 to-rose-400/15">
            <ChefHat className="h-16 w-16 text-amber-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          {recipe.cuisine_type && (
            <span className="rounded-full border border-white/10 bg-white/80 px-3 py-1 text-xs font-medium text-slate-900 backdrop-blur-sm">
              {recipe.cuisine_type}
            </span>
          )}
          {recipe.difficulty && (
            <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-xs font-medium capitalize text-amber-700">
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <Link to={`/recipes/${recipe.id}`} className="mb-4 block">
          <h3 className="line-clamp-2 text-2xl font-semibold text-slate-950 transition group-hover:text-fuchsia-600">
            {recipe.name}
          </h3>
          {recipe.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{recipe.description}</p>
          )}
        </Link>

        <div className="mb-5 flex flex-wrap gap-2">
          {recipe.dietary_tags && recipe.dietary_tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-white/8 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-5 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{totalTime} mins</span>
          </div>
          {recipe.calories && <span>{recipe.calories} cal</span>}
        </div>

        <div className="flex gap-2 border-t border-white/8 pt-4">
          <Link
            to={`/recipes/${recipe.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-300 to-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
          >
            View Recipe
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="inline-flex items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-rose-600 transition hover:bg-rose-400/14"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricPill = ({ label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-3 text-center backdrop-blur-sm">
    <p className="text-2xl font-semibold text-slate-950">{value}</p>
    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
  </div>
);

export default MyRecipes;
