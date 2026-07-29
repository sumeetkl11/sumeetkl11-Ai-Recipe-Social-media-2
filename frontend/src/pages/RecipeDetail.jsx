import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api'
import useRevalidateOnFocus from '../hooks/useRevalidateOnFocus';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecipe = useCallback(async (options = {}) => {
        const silent = options.silent && Boolean(recipe);
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await api.get(`/recipes/${id}`);
            const recipeData = response.data.data.recipe;
            setRecipe(recipeData);
            setServings(recipeData.servings || 4);
        } catch (error) {   
            toast.error('Failed to load recipe');
            navigate('/recipes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id, navigate, recipe]);

    useRevalidateOnFocus(() => fetchRecipe({ silent: true }), { intervalMs: 60000 });

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        try {
            await api.delete(`/recipes/${id}`);
            toast.success('Recipe deleted');
            navigate('/recipes');
        } catch (error) {
            toast.error('Failed to delete recipe');
        }  
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty, originalServings) => {
        return ((originalQty * servings) / originalServings).toFixed(2);
    };

    if (loading) {
        return (
            <div className="page-bg min-h-screen">
                <Navbar/>
                <div className="px-4 py-8">
                    <div className="glass-panel loading-skeleton h-64 rounded-[32px]"></div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return null;
    }

    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;

    return (
        <div className="page-bg min-h-screen">
            <Navbar />

            <div className="mx-auto px-4 py-8 sm:px-6">
                {/* Back Button */}
                <Link
                    to="/recipes"
                    className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Recipes
                </Link>

                {/* AI-Generated Hero Image */}
                {recipe.image_url && (
                    <div className="relative mb-6 h-72 overflow-hidden rounded-[32px]">
                        <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 via-transparent to-transparent rounded-[32px]" />
                        <div className="absolute bottom-4 left-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                <Sparkles className="h-3 w-3" />
                                AI-Generated Photo
                            </span>
                        </div>
                    </div>
                )}

                {/* Recipe Header */}
                <div className="page-hero glass-panel mb-6 rounded-[32px] p-8">
                    <div className="eyebrow mb-4">
                        <Sparkles className="h-4 w-4" />
                        Recipe Studio
                    </div>
                    {refreshing && (
                        <div className="glass-badge mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Refreshing recipe
                        </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
                            {recipe.description && (
                                <p className="text-gray-600 text-lg">{recipe.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDelete}
                            className="rounded-2xl border border-rose-400/20 bg-rose-500/8 p-3 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {recipe.cuisine_type}
                            </span>
                        )}
                        {recipe.difficulty && (
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {recipe.difficulty}
                            </span>
                        )}
                        {recipe.dietary_tags && recipe.dietary_tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">{totalTime} minutes</span>
                        </div>
                        {recipe.prep_time && (
                            <div className="text-sm">
                                Prep: {recipe.prep_time} min
                            </div>
                        )}
                        {recipe.cook_time && (
                            <div className="text-sm">
                                Cook: {recipe.cook_time} min
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ingredients Section */}
                    <div className="lg:col-span-1">
                        <div className="glass-card sticky top-24 rounded-[30px] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Servings:</span>
                                </div>
                            </div>

                            {/* Servings Adjuster */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        className="ghost-input flex h-10 w-10 items-center justify-center rounded-2xl font-medium"
                                    >
                                        −
                                    </button>
                                    <span className="text-lg font-semibold text-gray-900 w-12 text-center">
                                        {servings}
                                    </span>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="ghost-input flex h-10 w-10 items-center justify-center rounded-2xl font-medium"
                                    >
                                        +
                                    </button>
                                    {servings !== originalServings && (
                                        <button
                                            onClick={() => setServings(originalServings)}
                                            className="text-sm text-fuchsia-600 hover:text-sky-700 font-medium"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-3">
                                {recipe.ingredients && recipe.ingredients.map((ingredient, index) => {
                                    const adjustedQty = adjustQuantity(ingredient.quantity, originalServings);
                                    const isChecked = checkedIngredients.has(index);

                                    return (
                                        <label
                                            key={index}
                                            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/70 bg-white/70 p-3 group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleIngredient(index)}
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className={`flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                <span className="font-medium">{adjustedQty}</span> {ingredient.unit} {ingredient.name || ingredient.ingredient_name }
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card rounded-[30px] p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
                            <ol className="space-y-4">
                                {recipe.instructions && recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                        <span className="shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700 pt-1 flex-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Nutrition Info */}
                        {recipe.nutrition && (
                            <div className="glass-card rounded-[30px] p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Nutrition (per serving)</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fat} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber ?? '_'} unit={recipe.nutrition.fiber ? "g" : ""} />
                                </div>
                            </div>
                        )}

                        {/* User Notes */}
                        {recipe.user_notes && (
                            <div className="glass-card rounded-[30px] border border-emerald-200 p-6">
                                <h3 className="mb-2 font-semibold text-emerald-900">Notes</h3>
                                <p className="text-emerald-800">{recipe.user_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionCard = ({ label, value, unit }) => (
    <div className="text-center p-4 bg-white/80 rounded-2xl">
        <div className="text-2xl font-bold text-gray-900">{value}{unit}</div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
);

export default RecipeDetail;
