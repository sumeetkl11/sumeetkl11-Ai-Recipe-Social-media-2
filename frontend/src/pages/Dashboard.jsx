import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChefHat, UtensilsCrossed, Calendar, Clock, ArrowRight, Sparkles, Flame, Soup, NotebookPen, Heart, MessageCircle, RotateCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    pantryItems: 0,
    mealsThisWeek: 0
  });
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [upcomingMeals, setUpcomingMeals] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (options = {}) => {
    const silent = options.silent && (recentRecipes.length > 0 || upcomingMeals.length > 0 || popularPosts.length > 0);
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        api.get('/recipes'),
        api.get('/pantry/stats'),
        api.get('/meal-plans/stats'),
        api.get('/recipes/recent?limit=5'),
        api.get('/meal-plans/upcoming?limit=5'),
        api.get('/posts?limit=20&page=1')
      ]);

      const [recipesRes, pantryRes, mealsRes, recentRes, upcomingRes, postsRes] = results;

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      if (failedCount > 0) {
        toast.error(`${failedCount} dashboard section(s) failed to load — showing available data`);
      }

      if (recipesRes.status === 'fulfilled' || pantryRes.status === 'fulfilled' || mealsRes.status === 'fulfilled') {
        const recipesData = recipesRes.status === 'fulfilled' ? recipesRes.value.data?.data : null;
        const pantryData = pantryRes.status === 'fulfilled' ? pantryRes.value.data?.data : null;
        const mealsData = mealsRes.status === 'fulfilled' ? mealsRes.value.data?.data : null;

        setStats((prev) => ({
          totalRecipes: recipesData?.stats?.total_recipes || recipesData?.recipes?.length || prev.totalRecipes,
          pantryItems: pantryData?.total_items ?? prev.pantryItems,
          mealsThisWeek: mealsData?.stats?.this_week_count ?? prev.mealsThisWeek
        }));
      }

      if (recentRes.status === 'fulfilled') {
        const recipesList = recentRes.value.data?.data?.recipes || (Array.isArray(recentRes.value.data?.data) ? recentRes.value.data.data : []);
        setRecentRecipes(recipesList);
      }

      if (upcomingRes.status === 'fulfilled') {
        const mealsList = upcomingRes.value.data?.data?.meals || (Array.isArray(upcomingRes.value.data?.data) ? upcomingRes.value.data.data : []);
        setUpcomingMeals(mealsList);
      }

      if (postsRes.status === 'fulfilled') {
        const postsList = postsRes.value.data?.data || postsRes.value.data?.posts || [];
        if (Array.isArray(postsList)) {
          setPopularPosts(
            [...postsList]
              .sort((a, b) => {
                const scoreA = (a.like_count || 0) * 3 + (a.comment_count || 0);
                const scoreB = (b.like_count || 0) * 3 + (b.comment_count || 0);
                return scoreB - scoreA;
              })
              .slice(0, 4)
          );
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [popularPosts.length, recentRecipes.length, upcomingMeals.length]);

  // ponytail: load once on mount only — the focus-refresh hook stays disabled to respect rate limits
  useEffect(() => {
    void fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="page-bg min-h-screen">
        <Navbar />
        <div className="mx-auto px-4 pb-12 pt-8 sm:px-6">
          <div className="glass-panel loading-skeleton h-56 rounded-[32px]" />
          <div className="mt-6 grid gap-4">
            <div className="glass-card loading-skeleton h-28 rounded-[28px]" />
            <div className="glass-card loading-skeleton h-28 rounded-[28px]" />
            <div className="glass-card loading-skeleton h-28 rounded-[28px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen">
      <Navbar />

      <div className="mx-auto px-4 pb-12 pt-8 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
          <div className="page-hero glass-panel relative overflow-hidden rounded-[32px] p-7 md:p-8">
            <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-200/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="eyebrow">
                  <Sparkles className="h-4 w-4" />
                  Daily Mise en Place
                </div>
                <button
                  onClick={() => fetchDashboardData({ silent: true })}
                  disabled={refreshing}
                  className="glass-badge flex items-center gap-1.5 text-xs font-medium text-slate-700 transition hover:bg-white/80"
                  title="Refresh Dashboard Data"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <h1 className="max-w-2xl font-display text-4xl leading-tight text-slate-950 md:text-6xl">
                Build dinner plans that look and feel restaurant-ready.
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
                Your kitchen dashboard now starts with curated recipes, richer motion, and a faster path from pantry to plated post.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/generate" className="cta-button">
                  Generate a Recipe
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/recipes" className="secondary-button">
                  Browse My Recipes
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <HeroMetric icon={<Flame className="h-4 w-4" />} label="Saved recipes" value={stats.totalRecipes} />
                <HeroMetric icon={<Soup className="h-4 w-4" />} label="Pantry items" value={stats.pantryItems} />
                <HeroMetric icon={<NotebookPen className="h-4 w-4" />} label="Meals this week" value={stats.mealsThisWeek} />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <SpotlightCard
              to="/pantry"
              title="Pantry Pulse"
              description="Track what you already have and let the generator work from real ingredients."
              icon={<UtensilsCrossed className="h-5 w-5" />}
            />
            <SpotlightCard
              to="/meal-plan"
              title="Weekly Flow"
              description="Turn recent ideas into a practical weeknight plan without leaving the dashboard."
              icon={<Calendar className="h-5 w-5" />}
            />
            <SpotlightCard
              to="/social"
              title="Share the Plate"
              description="Post finished dishes and keep your social feed tied to saved recipes."
              icon={<ChefHat className="h-5 w-5" />}
            />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="content-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Freshly Saved</p>
                <h2 className="mt-2 font-display text-2xl text-slate-950">Recent Recipes</h2>
              </div>
              <Link to="/recipes" className="panel-link">
                View all
              </Link>
            </div>

            {recentRecipes.length > 0 ? (
              <div className="space-y-3">
                {recentRecipes.map((recipe, index) => (
                  <Link
                    key={recipe.id}
                    to={`/recipes/${recipe.id}`}
                    className="recipe-list-item"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="recipe-list-icon">
                      <ChefHat className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900">{recipe.name}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} mins total
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyPanel text="Your default starter recipes will appear here as soon as they load." />
            )}
          </div>

          <div className="content-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Plan Ahead</p>
                <h2 className="mt-2 font-display text-2xl text-slate-950">Upcoming Meals</h2>
              </div>
              <Link to="/meal-plan" className="panel-link">
                View calendar
              </Link>
            </div>

            {upcomingMeals.length > 0 ? (
              <div className="space-y-3">
                {upcomingMeals.map((meal, index) => (
                  <div key={meal.id} className="meal-list-item" style={{ animationDelay: `${index * 90}ms` }}>
                    <div className="meal-list-icon">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900">{meal.recipe_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{meal.meal_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel text="No meals planned yet. Add one from the weekly planner." />
            )}
          </div>

          <div className="content-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Trending Social</p>
                <h2 className="mt-2 font-display text-2xl text-slate-950">Popular Posts</h2>
              </div>
              <Link to="/social" className="panel-link">
                Open feed
              </Link>
            </div>

            {popularPosts.length > 0 ? (
              <div className="space-y-3">
                {popularPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to="/social"
                    className="recipe-list-item"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="recipe-list-icon">
                      <ChefHat className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900">{post.recipe_name || 'Recipe post'}</h3>
                      <p className="mt-1 truncate text-sm text-slate-600">{post.caption || 'Shared from the social kitchen feed.'}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {post.like_count || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {post.comment_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyPanel text="Popular social posts will show here once the community starts interacting." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const HeroMetric = ({ icon, label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
    <div className="mb-3 inline-flex rounded-2xl bg-white/90 p-2 text-fuchsia-600">{icon}</div>
    <p className="text-3xl font-semibold text-slate-950">{value}</p>
    <p className="mt-1 text-sm text-slate-600">{label}</p>
  </div>
);

const SpotlightCard = ({ to, title, description, icon }) => (
  <Link to={to} className="glass-card group min-h-[152px] p-6">
    <div className="mb-4 inline-flex rounded-2xl bg-white/90 p-3 text-fuchsia-600 transition group-hover:scale-110 group-hover:bg-white">
      {icon}
    </div>
    <h3 className="font-display text-2xl text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
  </Link>
);

const EmptyPanel = ({ text }) => (
  <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/50 px-8 text-center text-slate-600">
    {text}
  </div>
);

const StatCard = ({ icon, label, value, accent }) => {
  const accentClasses = {
    amber: 'from-amber-300/30 to-orange-400/10 text-amber-100',
    sky: 'from-sky-300/30 to-cyan-400/10 text-sky-100',
    rose: 'from-rose-300/30 to-pink-400/10 text-rose-100'
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${accentClasses[accent]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
