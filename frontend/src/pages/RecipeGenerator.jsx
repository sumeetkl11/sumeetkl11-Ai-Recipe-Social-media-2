import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ChefHat,
  Sparkles,
  Plus,
  X,
  Clock,
  Users,
  WandSparkles,
  Salad,
  Soup,
  Sandwich,
  ArrowRight,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const COOKING_TIMES = [
  { value: 'quick', label: 'Quick (<30 min)' },
  { value: 'medium', label: 'Medium (30-60 min)' },
  { value: 'long', label: 'Long (>60 min)' }
];
const STARTER_INGREDIENTS = ['eggs', 'spinach', 'garlic', 'tomatoes', 'chicken', 'rice', 'mushrooms', 'basil'];
const RECIPE_MOODS = [
  { title: 'Comfort bowl', icon: Soup, ingredients: ['rice', 'chicken', 'ginger'] },
  { title: 'Green reset', icon: Salad, ingredients: ['spinach', 'cucumber', 'avocado'] },
  { title: 'Fast lunch', icon: Sandwich, ingredients: ['eggs', 'cheese', 'tomatoes'] }
];

const RecipeGenerator = () => {
  const location = useLocation();
  const [ingredients, setIngredients] = useState(location.state?.ingredients || []);
  const [inputValue, setInputValue] = useState('');
  const [usePantry, setUsePantry] = useState(Boolean(location.state?.usePantry));
  const [pantryItemsList, setPantryItemsList] = useState([]);
  const [cuisineType, setCuisineType] = useState('Any');
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [servings, setServings] = useState(4);
  const [cookingTime, setCookingTime] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    if (usePantry && pantryItemsList.length === 0) {
      api.get('/pantry')
        .then(res => setPantryItemsList(res.data.data.items || []))
        .catch(err => console.error('Error fetching pantry preview:', err));
    }
  }, [usePantry, pantryItemsList.length]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await api.get('/user/profile');
        const preferences = response.data.data.preferences;

        if (preferences) {
          if (preferences.dietary_restrictions && preferences.dietary_restrictions.length > 0) {
            setDietaryRestrictions(preferences.dietary_restrictions);
          }

          if (preferences.preferred_cuisine && preferences.preferred_cuisine.length > 0) {
            setCuisineType(preferences.preferred_cuisine[0]);
          }

          if (preferences.default_servings) {
            setServings(preferences.default_servings);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setPreferencesLoaded(true);
      }
    };

    fetchUserPreferences();
  }, []);

  useEffect(() => {
    setImageLoaded(false);
  }, [generatedRecipe?.image_url]);

  const addIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter((item) => item !== ingredient));
  };

  const toggleDietary = (option) => {
    if (dietaryRestrictions.includes(option)) {
      setDietaryRestrictions(dietaryRestrictions.filter((item) => item !== option));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, option]);
    }
  };

  const addSuggestedIngredients = (items) => {
    const nextIngredients = [...ingredients];
    items.forEach((item) => {
      if (!nextIngredients.some((existing) => existing.toLowerCase() === item.trim().toLowerCase())) {
        nextIngredients.push(item.trim());
      }
    });
    setIngredients(nextIngredients);
  };

  const handleGenerate = async () => {
    if (!usePantry && ingredients.length === 0) {
      toast.error('Please add at least one ingredient or use pantry items');
      return;
    }

    setGenerating(true);
    setGeneratedRecipe(null);
    setImageLoaded(false);

    try {
      const response = await api.post('/recipes/generate', {
        ingredients,
        usePantryIngredients: usePantry,
        dietaryRestrictions,
        cuisineType: cuisineType === 'Any' ? 'any' : cuisineType,
        servings,
        cookingTime
      });

      setGeneratedRecipe(response.data.data.recipe);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      toast.error(error.response?.data.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) {
      return;
    }

    setSaving(true);
    try {
      await api.post('/recipes', {
        name: generatedRecipe.name,
        description: generatedRecipe.description,
        cuisine_type: generatedRecipe.cuisineType || generatedRecipe.cuisine_type,
        difficulty: generatedRecipe.difficulty,
        prepTime: generatedRecipe.prepTime,
        cookTime: generatedRecipe.cookTime,
        servings: generatedRecipe.servings,
        instructions: generatedRecipe.instructions,
        dietary_tags: generatedRecipe.dietary_tags || [],
        ingredients: generatedRecipe.ingredients,
        nutrition: generatedRecipe.nutrition,
        image_url: generatedRecipe.image_url
      });
      toast.success('Recipe saved successfully!');
    } catch (error) {
      toast.error('Failed to save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-8xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="glass-panel mb-8 overflow-hidden rounded-[34px] p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.85fr]">
            <div>
              <div className="eyebrow mb-4">
                <WandSparkles className="h-4 w-4" />
                AI Recipe Studio
              </div>
              <h1 className="max-w-2xl font-display text-4xl leading-tight text-slate-950 md:text-6xl">
                Turn ingredients into plated ideas with richer prompts and faster iteration.
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
                Start with pantry items, use a curated mood, or assemble your own ingredient stack. The generator now sits inside a more cinematic workspace with stronger motion and clearer controls.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {STARTER_INGREDIENTS.map((item) => (
                  <button
                    key={item}
                    onClick={() => addSuggestedIngredients([item])}
                    className="rounded-full border border-white/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {RECIPE_MOODS.map(({ title, icon: Icon, ingredients: moodIngredients }) => (
                <button
                  key={title}
                  onClick={() => addSuggestedIngredients(moodIngredients)}
                  className="glass-card group p-5 text-left"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-white/90 p-3 text-amber-600 transition group-hover:scale-110 group-hover:bg-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{moodIngredients.join(' · ')}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-2xl text-slate-950">Ingredient Deck</h2>
                <span className="text-sm text-slate-600">{ingredients.length} selected</span>
              </div>

              <div className="mb-4 rounded-2xl border border-white/10 bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="use-pantry"
                    checked={usePantry}
                    onChange={(event) => setUsePantry(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 accent-amber-400 cursor-pointer"
                  />
                  <label htmlFor="use-pantry" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Use ingredients from my pantry
                  </label>
                </div>
                {usePantry && pantryItemsList.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
                    <span className="font-semibold text-slate-700">Pantry items ready to use:</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {pantryItemsList.slice(0, 10).map((item) => (
                        <span key={item.id} className="inline-flex items-center rounded-full border border-white/40 bg-amber-300/15 px-2.5 py-1 font-medium text-amber-800">
                          {item.name} ({item.quantity} {item.unit})
                        </span>
                      ))}
                      {pantryItemsList.length > 10 && (
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 font-medium text-slate-600">
                          +{pantryItemsList.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addIngredient();
                    }
                  }}
                  placeholder="Add ingredient (e.g., tomatoes)"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-300/40"
                />
                <button
                  onClick={addIngredient}
                  className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-amber-300 to-orange-400 px-4 py-3 text-slate-950 transition hover:brightness-105"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <span
                      key={`${ingredient}-${index}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/85 px-3 py-2 text-sm text-slate-700"
                    >
                      {ingredient}
                      <button onClick={() => removeIngredient(ingredient)} className="transition hover:text-rose-300">
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card space-y-5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-slate-950">Preferences</h2>
                {preferencesLoaded && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Synced with your preferences
                  </span>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Cuisine Type</label>
                <select
                  value={cuisineType}
                  onChange={(event) => setCuisineType(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-300/40"
                >
                  {CUISINES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleDietary(option)}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        dietaryRestrictions.includes(option)
                          ? 'bg-linear-to-r from-amber-300 to-orange-400 text-slate-950'
                          : 'border border-white/10 bg-white/85 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Servings: {servings}
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={servings}
                  onChange={(event) => setServings(parseInt(event.target.value, 10))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-amber-400"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>1</span>
                  <span>12</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Cooking Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {COOKING_TIMES.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCookingTime(option.value)}
                      className={`rounded-2xl border p-3 text-sm font-medium transition ${
                        cookingTime === option.value
                          ? 'border-amber-300/50 bg-amber-300/12 text-amber-700'
                          : 'border-white/10 bg-white/85 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="cta-button flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-slate-950/60 border-t-transparent animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Recipe
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            {generating ? (
              /* ── Skeleton while generating ── */
              <div className="glass-card overflow-hidden p-0">
                <div className="loading-skeleton h-72 w-full" />
                <div className="space-y-4 p-6 md:p-8">
                  <div className="loading-skeleton h-4 w-24 rounded-full" />
                  <div className="loading-skeleton h-8 w-3/4 rounded-2xl" />
                  <div className="loading-skeleton h-4 w-full rounded-full" />
                  <div className="loading-skeleton h-4 w-5/6 rounded-full" />
                  <div className="flex gap-3">
                    <div className="loading-skeleton h-9 w-28 rounded-full" />
                    <div className="loading-skeleton h-9 w-24 rounded-full" />
                    <div className="loading-skeleton h-9 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ) : generatedRecipe ? (
              <div className="glass-card overflow-hidden p-0">
                {/* Suggested Photo */}
                {generatedRecipe.image_url ? (
                  <div className="relative h-72 overflow-hidden">
                    <img
                      key={`${generatedRecipe.name}-${generatedRecipe.image_url}`}
                      src={generatedRecipe.image_url}
                      alt={generatedRecipe.name}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
                      ref={(imgEl) => {
                        if (imgEl && imgEl.complete && !imageLoaded) {
                          setImageLoaded(true);
                        }
                      }}
                      className={`h-full w-full object-cover transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {!imageLoaded && <div className="loading-skeleton absolute inset-0" />}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        <Sparkles className="h-3 w-3" />
                        Food Photography
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center bg-linear-to-br from-amber-200/30 via-orange-400/20 to-rose-400/15">
                    <ChefHat className="h-14 w-14 text-amber-600/60" />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <div className="eyebrow mb-4">
                      <CheckCircle2 className="h-4 w-4" />
                      Recipe Ready
                    </div>
                    <h2 className="font-display text-3xl text-slate-950 md:text-4xl">{generatedRecipe.name}</h2>
                    <p className="mt-3 text-slate-600">{generatedRecipe.description}</p>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/85 px-4 py-2 text-slate-700">
                        <Clock className="h-4 w-4" />
                        {generatedRecipe.prepTime + generatedRecipe.cookTime} mins
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/85 px-4 py-2 text-slate-700">
                        <Users className="h-4 w-4" />
                        {generatedRecipe.servings} servings
                      </div>
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 font-medium text-amber-700">
                        {generatedRecipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-display text-2xl text-slate-950">Ingredients</h3>
                      <div className="space-y-2">
                        {generatedRecipe.ingredients?.map((ingredient, index) => (
                          <div key={`${ingredient.name}-${index}`} className="flex justify-between rounded-2xl border border-white/8 bg-white/80 px-4 py-3">
                            <span className="text-slate-900">{ingredient.name}</span>
                            <span className="text-slate-600">
                              {ingredient.quantity} {ingredient.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 font-display text-2xl text-slate-950">Instructions</h3>
                      <div className="space-y-3">
                        {generatedRecipe.instructions?.map((instruction, index) => (
                          <div key={`${index}-${instruction.slice(0, 12)}`} className="flex gap-3 rounded-2xl border border-white/8 bg-white/80 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-amber-300 to-orange-400 text-sm font-semibold text-slate-950">
                              {index + 1}
                            </div>
                            <p className="pt-1 text-slate-700">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {generatedRecipe.nutrition && (
                      <div>
                        <h3 className="mb-3 font-display text-2xl text-slate-950">Nutrition</h3>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                          {Object.entries(generatedRecipe.nutrition).map(([key, value]) => (
                            <div key={key} className="rounded-2xl border border-white/8 bg-white/80 p-3 text-center">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</p>
                              <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleSaveRecipe}
                      disabled={saving}
                      className="cta-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        'Saving...'
                      ) : (
                        <>
                          <Bookmark className="h-5 w-5" />
                          Save Recipe
                        </>
                      )}
                    </button>
                    <Link
                      to="/recipes"
                      className="secondary-button justify-center"
                    >
                      View All Saved
                    </Link>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="secondary-button justify-center text-amber-700 hover:text-amber-800"
                    >
                      <Sparkles className="h-4 w-4" />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card flex min-h-[640px] flex-col items-center justify-center p-12 text-center">
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-linear-to-br from-amber-300 to-orange-400 text-slate-950 shadow-[0_18px_45px_rgba(251,146,60,0.28)] animate-float">
                  <ChefHat className="h-12 w-12" />
                </div>
                <h3 className="font-display text-3xl text-slate-950">Ready to Generate</h3>
                <p className="mt-3 max-w-md text-slate-600">
                  Add ingredients, use the pantry, or borrow one of the recipe moods above. Your generated recipe will appear here with save-ready structure.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <PreviewTile icon={<Soup className="h-5 w-5" />} label="Structured ingredients" />
                  <PreviewTile icon={<Clock className="h-5 w-5" />} label="Time + serving guidance" />
                  <PreviewTile icon={<ArrowRight className="h-5 w-5" />} label="Save-ready output" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Generate Button Bar */}
      <div className="sticky bottom-4 z-40 mx-4 mt-6 block md:hidden">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="cta-button w-full shadow-xl justify-center py-3.5 text-base font-semibold"
        >
          <Sparkles className="h-5 w-5" />
          {generating ? 'Crafting Recipe...' : 'Generate Recipe Now'}
        </button>
      </div>
    </div>
  );
};

const PreviewTile = ({ icon, label }) => (
  <div className="rounded-3xl border border-white/10 bg-white/80 px-4 py-4 text-center text-slate-700">
    <div className="mb-3 inline-flex rounded-2xl bg-white/90 p-3 text-amber-600">{icon}</div>
    <p className="text-sm text-slate-700">{label}</p>
  </div>
);

export default RecipeGenerator;
