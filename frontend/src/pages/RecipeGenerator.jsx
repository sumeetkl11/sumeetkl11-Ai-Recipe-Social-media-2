import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American'];
const DIETARY_OPTIONS = ['Vegan', 'Gluten-Free', 'Keto', 'Vegetarian', 'Dairy-Free'];

const RecipeGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ingredientsText, setIngredientsText] = useState(location.state?.ingredients?.join(', ') || '');
  const [usePantry, setUsePantry] = useState(Boolean(location.state?.usePantry));
  const [cuisineType, setCuisineType] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [servings, setServings] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [recentCreations, setRecentCreations] = useState([]);
  const [saving, setSaving] = useState(false);

  const displayPrepTime = generatedRecipe?.prep_time ?? generatedRecipe?.prepTime ?? 0;
  const displayCookTime = generatedRecipe?.cook_time ?? generatedRecipe?.cookTime ?? 0;
  const displayCuisine = generatedRecipe?.cuisine_type ?? generatedRecipe?.cuisineType ?? cuisineType;
  const displayDifficulty = generatedRecipe?.difficulty || 'medium';
  const displayNutrition = generatedRecipe?.nutrition || {};
  const displayTips = generatedRecipe?.cookingTips || generatedRecipe?.tips || [];
  const displayTags = generatedRecipe?.dietary_tags || generatedRecipe?.dietaryTags || [];

  useEffect(() => {
    // Fetch recent creations for the right sidebar
    api.get('/recipes/recent?limit=3')
      .then(res => {
        const recipesList = res.data?.data?.recipes || (Array.isArray(res.data?.data) ? res.data.data : []);
        setRecentCreations(recipesList);
      })
      .catch(err => console.error('Error fetching recent recipes:', err));
  }, []);

  const toggleDietary = (option) => {
    if (dietaryRestrictions.includes(option)) {
      setDietaryRestrictions(dietaryRestrictions.filter((item) => item !== option));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, option]);
    }
  };

  const toggleCuisine = (cuisine) => {
    if (cuisineType === cuisine) {
      setCuisineType('');
    } else {
      setCuisineType(cuisine);
    }
  };

  const handleGenerate = async () => {
    const parsedIngredients = ingredientsText.split(',').map(s => s.trim()).filter(Boolean);
    if (!usePantry && parsedIngredients.length === 0) {
      toast.error("Please add at least one ingredient or enable 'Sync from Pantry'");
      return;
    }

    setGenerating(true);
    setGeneratedRecipe(null);

    try {
      const response = await api.post('/recipes/generate', {
        ingredients: parsedIngredients,
        usePantryIngredients: usePantry,
        dietaryRestrictions,
        cuisineType: cuisineType || 'any',
        servings,
        cookingTime: 'medium'
      });

      setGeneratedRecipe(response.data.data.recipe);
      toast.success('Recipe generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    setSaving(true);
    try {
      const res = await api.post('/recipes', generatedRecipe);
      toast.success('Recipe saved to your collection!');
      
      const newRecipeId = res.data?.data?.recipe?.id || res.data?.data?.id;
      if (newRecipeId) {
        navigate(`/recipes/${newRecipeId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative overflow-hidden">
      <Navbar />

      <main className="pt-24 pb-32 px-4 md:px-10 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Form) */}
          <section className="lg:col-span-7 flex flex-col gap-8">
            <div className="cc-glass-panel p-8 rounded-3xl">
              <h1 className="font-headline-lg text-headline-lg mb-2">Recipe Generator</h1>
              <p className="text-on-surface-variant mb-8">Let's craft something exceptional with what you have.</p>

              <div className="space-y-8">
                {/* Pantry Input */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-label-md text-label-md text-primary uppercase tracking-wider">What's in your pantry?</label>
                    <button 
                      onClick={() => setUsePantry(!usePantry)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors text-label-sm font-semibold ${usePantry ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(245,158,11,0.4)]' : 'border-primary/20 text-primary hover:bg-primary/5'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">kitchen</span>
                      {usePantry ? 'Pantry Synced' : 'Sync from Pantry'}
                    </button>
                  </div>
                  <textarea 
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    className="w-full h-40 bg-white/30 border border-white/50 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-md outline-none text-body-md" 
                    placeholder="E.g., Chicken breast, spinach, heavy cream, garlic, parmesan (comma separated)..."
                  ></textarea>
                </div>

                {/* Dietary Preferences */}
                <div>
                  <label className="block font-label-md text-label-md mb-3 text-primary uppercase tracking-wider">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-3">
                    {DIETARY_OPTIONS.map(option => (
                      <button 
                        key={option}
                        onClick={() => toggleDietary(option)}
                        className={`px-5 py-2 rounded-full text-body-md transition-all active:scale-95 ${
                          dietaryRestrictions.includes(option) 
                          ? 'cc-chip-dietary-active font-semibold shadow-lg shadow-primary/20' 
                          : 'border border-white/40 bg-white/10 backdrop-blur-md hover:bg-white/20'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuisine Type */}
                <div>
                  <label className="block font-label-md text-label-md mb-3 text-primary uppercase tracking-wider">Cuisine Type</label>
                  <div className="flex flex-wrap gap-3">
                    {CUISINES.map(cuisine => (
                      <button 
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-5 py-2 rounded-full text-body-md transition-all active:scale-95 ${
                          cuisineType === cuisine 
                          ? 'cc-chip-active font-semibold' 
                          : 'border border-outline-variant bg-white/20 hover:bg-white/40'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Serving Size */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-label-md text-label-md text-primary uppercase tracking-wider">Serving Size</label>
                    <p className="text-label-sm text-on-surface-variant">How many people are dining?</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white/30 border border-white/50 rounded-full p-1 px-4">
                    <button 
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-body-md">remove</span>
                    </button>
                    <span className="font-headline-md text-headline-md min-w-[2ch] text-center">{servings}</span>
                    <button 
                      onClick={() => setServings(servings + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-body-md">add</span>
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="cc-cta-gradient w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-white font-headline-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {generating ? 'hourglass_top' : 'auto_awesome'}
                  </span>
                  {generating ? 'Crafting Recipe...' : 'Generate Recipe'}
                </button>
              </div>
            </div>
          </section>

          {/* Right Column (Status/History) */}
          <aside className="lg:col-span-5 space-y-8">
            
            {/* Loading / Result State Panel */}
            {generating ? (
              <div className="cc-glass-panel p-6 rounded-3xl overflow-hidden relative border border-primary/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <span className="material-symbols-outlined text-primary text-4xl animate-bounce">cooking</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping"></div>
                    </div>
                    <h2 className="font-headline-md text-headline-md">Your recipe is being crafted...</h2>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Skeleton Loader 1 */}
                  <div className="relative h-28 w-full bg-white/20 rounded-2xl border border-white/40 overflow-hidden flex items-center px-5 gap-4">
                    <div className="absolute inset-0 cc-shimmer-gradient"></div>
                    <div className="w-16 h-16 bg-white/40 rounded-xl relative z-10 animate-pulse"></div>
                    <div className="flex-1 space-y-3 relative z-10">
                      <div className="h-4 w-3/4 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="h-2 w-4 bg-white/30 rounded-full"></div>
                        <div className="h-2 w-4 bg-white/30 rounded-full"></div>
                        <div className="h-2 w-4 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  {/* Skeleton Loader 2 */}
                  <div className="relative h-20 w-full bg-white/10 rounded-2xl border border-white/20 overflow-hidden flex items-center px-5 gap-4">
                    <div className="absolute inset-0 cc-shimmer-gradient" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl relative z-10 animate-pulse"></div>
                    <div className="flex-1 space-y-2 relative z-10">
                      <div className="h-3 w-2/3 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="h-2 w-1/3 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : generatedRecipe ? (
              <div className="cc-glass-panel p-6 rounded-3xl relative border border-primary/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline-md text-headline-md text-primary">Generated Masterpiece</h2>
                  <button 
                    onClick={handleSaveRecipe}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full font-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      bookmark_add
                    </span>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {generatedRecipe.image_url && (
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-white/40">
                      <img src={generatedRecipe.image_url} alt={generatedRecipe.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <h3 className="font-display-lg text-3xl md:text-4xl font-bold leading-tight mb-3">{generatedRecipe.name}</h3>
                  <p className="text-body-lg text-on-surface-variant leading-relaxed">{generatedRecipe.description}</p>

                  <div className="flex flex-wrap gap-2 pt-3">
                    {displayCuisine && (
                      <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                        {displayCuisine}
                      </span>
                    )}
                    {displayDifficulty && (
                      <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        displayDifficulty === 'easy' ? 'border border-green-200 bg-green-50 text-green-700' :
                        displayDifficulty === 'medium' ? 'border border-yellow-200 bg-yellow-50 text-yellow-700' :
                        'border border-orange-200 bg-orange-50 text-orange-700'
                      }`}>
                        <span className="text-sm">
                          {displayDifficulty === 'easy' ? '👨🍳' : displayDifficulty === 'medium' ? '👨🍳👨🍳' : '👨🍳👨🍳👨🍳'}
                        </span>
                        {displayDifficulty === 'easy' ? 'Beginner-Friendly' : 
                         displayDifficulty === 'medium' ? 'Intermediate' : 
                         'Advanced'}
                      </span>
                    )}
                    {displayTags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/40 bg-white/50 px-3 py-1 text-xs font-semibold text-on-surface-variant">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2 pb-4 border-b border-white/30">
                    <div className="flex items-center gap-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl px-3 py-2 border border-orange-200">
                      <span className="material-symbols-outlined text-[20px] text-orange-600">schedule</span>
                      <div>
                        <span className="font-bold text-gray-900">{displayPrepTime + displayCookTime}</span>
                        <span className="text-xs text-gray-600 ml-1">min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl px-3 py-2 border border-green-200">
                      <span className="material-symbols-outlined text-[20px] text-green-600">group</span>
                      <span className="font-bold text-gray-900">{generatedRecipe.servings || servings}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-label-md text-primary mb-3 flex items-center gap-1.5">
                      
                      Ingredients
                    </h4>
                    <ul className="text-sm space-y-1.5 text-on-surface-variant list-disc pl-5">
                      {generatedRecipe.ingredients?.map((ing, i) => (
                        <li key={i} className="leading-relaxed">
                          <span className="font-medium">{ing.original || ing.name}</span>
                          {ing.quantity ? <span className="text-gray-500"> — {ing.quantity} {ing.unit || ''}</span> : ''}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5">
                    <h4 className="font-label-md text-primary mb-3 flex items-center gap-1.5">
                      
                      Instructions
                    </h4>
                    <ol className="text-sm space-y-3 text-on-surface-variant list-decimal pl-5">
                      {generatedRecipe.instructions?.map((inst, i) => (
                        <li key={i} className="leading-relaxed pl-1">{inst.step || inst}</li>
                      ))}
                    </ol>
                  </div>

                  {displayTips.length > 0 && (
                    <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50">
                      <h4 className="font-label-md text-primary mb-2 flex items-center gap-1.5">
                        <span className="text-base">💡</span>
                        Beginner Cooking Tips
                      </h4>
                      <ul className="text-sm space-y-1.5 text-on-surface-variant list-disc pl-5">
                        {displayTips.map((tip, index) => (
                          <li key={index} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Object.keys(displayNutrition).length > 0 && (
                    <div className="mt-4 bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/40">
                      <h4 className="font-label-md text-gray-700 mb-3 flex items-center gap-1.5">
                        
                        Nutrition Info
                        <span className="text-xs text-gray-500 font-normal">(per serving)</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ['Calories', displayNutrition.calories, 'kcal'],
                          ['Protein', displayNutrition.protein, 'g'],
                          ['Carbs', displayNutrition.carbs, 'g'],
                          ['Fats', displayNutrition.fat, 'g'],
                          ['Fiber', displayNutrition.fiber, 'g']
                        ].filter(([_, value]) => value !== undefined).map(([label, value, unit]) => (
                          <div key={label} className="bg-white/70 border border-gray-100 rounded-xl p-2 text-center">
                            <p className="text-base font-bold text-gray-800">
                              {value ?? '0'}<span className="text-xs">{unit}</span>
                            </p>
                            <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}


          </aside>
        </div>
      </main>
    </div>
  );
};

export default RecipeGenerator;
