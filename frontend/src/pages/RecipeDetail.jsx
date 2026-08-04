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
    const [deleting, setDeleting] = useState(false);

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
        if (deleting) return;
        if (!window.confirm('Are you sure you want to delete this recipe?')) return;

        try {
            setDeleting(true);
            await api.delete(`/recipes/${id}`);
            toast.success('Recipe deleted');
            navigate('/recipes', { replace: true });
        } catch (error) {
            console.error('Failed to delete recipe:', error);
            toast.error(error.response?.data?.message || 'Failed to delete recipe');
        } finally {
            setDeleting(false);
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

            <div className="mx-auto px-4 py-8 sm:px-6 max-w-7xl relative">
                {/* Decorative blobs behind main container */}
                <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
                <div className="absolute top-[40%] left-10 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
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
                            loading="eager"
                            decoding="async"
                            fetchPriority="high"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                            }}
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
                <div className="page-hero glass-panel mb-8 rounded-[32px] p-8 overflow-hidden relative shadow-lg shadow-amber-500/5">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="eyebrow mb-4">
                        <Sparkles className="h-4 w-4" />
                        Recipe Studio
                    </div>
                    {refreshing && (
                        <div className="glass-badge mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Refreshing recipe
                        </div>
                    )}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{recipe.name}</h1>
                            {recipe.description && (
                                <p className="text-gray-700 text-xl leading-relaxed max-w-3xl">{recipe.description}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDelete}
                            type="button"
                            disabled={deleting}
                            className="relative z-10 inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/8 px-4 py-3 text-gray-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                        >
                            <Trash2 className="w-5 h-5" />
                            <span className="text-sm font-medium">{deleting ? 'Deleting...' : 'Delete'}</span>
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                        {recipe.cuisine_type && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                {recipe.cuisine_type}
                            </span>
                        )}
                        {recipe.difficulty && (
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                                recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                                <span className="text-base">
                                    {recipe.difficulty === 'easy' ? '👨🍳' : recipe.difficulty === 'medium' ? '👨🍳👨🍳' : '👨🍳👨🍳👨🍳'}
                                </span>
                                {recipe.difficulty === 'easy' ? 'Perfect for Beginners' : 
                                 recipe.difficulty === 'medium' ? 'Intermediate Recipe' : 
                                 'Advanced Cooking'}
                            </span>
                        )}
                        {recipe.dietary_tags && recipe.dietary_tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Meta Info - Beginner-Friendly Time Breakdown */}
                    <div className="flex flex-wrap gap-3 text-gray-700 relative z-10">
                        <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl px-5 py-3 border-2 border-orange-200 shadow-sm">
                            <Clock className="w-6 h-6 text-orange-600" />
                            <div>
                                <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold">Total Time</div>
                                <div className="font-bold text-2xl text-gray-900">{totalTime} <span className="text-sm font-normal">min</span></div>
                            </div>
                        </div>
                        {recipe.prep_time > 0 && (
                            <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl px-4 py-3 border border-blue-200 shadow-sm">
                                <span className="text-2xl">🔪</span>
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Prep</div>
                                    <div className="font-bold text-lg text-gray-900">{recipe.prep_time} <span className="text-sm font-normal">min</span></div>
                                </div>
                            </div>
                        )}
                        {recipe.cook_time > 0 && (
                            <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl px-4 py-3 border border-orange-200 shadow-sm">
                                <span className="text-2xl">🍳</span>
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold">Cook</div>
                                    <div className="font-bold text-lg text-gray-900">{recipe.cook_time} <span className="text-sm font-normal">min</span></div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl px-4 py-3 border border-green-200 shadow-sm">
                            <Users className="w-6 h-6 text-green-600" />
                            <div>
                                <div className="text-xs uppercase tracking-wide text-green-600 font-semibold">Servings</div>
                                <div className="font-bold text-lg text-gray-900">{recipe.servings || 4}</div>
                            </div>
                        </div>
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
                                            className="text-sm text-orange-600 hover:text-sky-700 font-medium"
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
                                                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md p-3 group hover:bg-white/60 transition-all shadow-sm"
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
                        <div className="glass-card rounded-[30px] p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="text-2xl">📝</span>
                                    Step-by-Step Instructions
                                </h2>
                                <p className="text-gray-600 text-sm">Follow these simple steps to create your dish</p>
                            </div>
                            <ol className="space-y-5">
                                {recipe.instructions && recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex gap-4 p-5 rounded-2xl border-2 border-white/60 bg-white/50 backdrop-blur-md shadow-md hover:shadow-lg transition-shadow">
                                        <span className="shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/30 text-white rounded-full flex items-center justify-center text-base font-bold">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-800 text-base leading-relaxed pt-1.5 flex-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Cooking Tips for Beginners */}
                        {recipe.cooking_tips && recipe.cooking_tips.length > 0 && (
                            <div className="glass-card rounded-[30px] p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/60 border-2 border-amber-200/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">💡</span>
                                    <h2 className="text-xl font-semibold text-gray-900">Cooking Tips for Beginners</h2>
                                </div>
                                <ul className="space-y-3">
                                    {recipe.cooking_tips.map((tip, index) => (
                                        <li key={index} className="flex gap-3 p-3 rounded-xl bg-white/70 border border-amber-100">
                                            <span className="shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <p className="text-gray-700 pt-0.5">{tip}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Nutrition Info - Moved to Bottom */}
                        {recipe.nutrition && Object.keys(recipe.nutrition).length > 0 && (
                            <div className="glass-card rounded-[30px] p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    Nutrition Information
                                    <span className="text-sm font-normal text-gray-500">(per serving)</span>
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
                                    <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
                                    <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
                                    <NutritionCard label="Fats" value={recipe.nutrition.fat} unit="g" />
                                    <NutritionCard label="Fiber" value={recipe.nutrition.fiber ?? '0'} unit={recipe.nutrition.fiber ? "g" : "g"} />
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
    <div className="text-center p-3 bg-gradient-to-br from-white to-gray-50/80 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="text-base font-bold text-gray-900">{value}<span className="text-xs ml-0.5">{unit}</span></div>
        <div className="text-[10px] font-semibold text-gray-500 mt-1.5 uppercase tracking-wider">{label}</div>
    </div>
);

export default RecipeDetail;
