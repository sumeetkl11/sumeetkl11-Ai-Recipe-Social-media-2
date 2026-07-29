import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ClickSpark from './components/ClickSpark';

import RouteSceneAnimator from './components/RouteSceneAnimator';
import { useAuth } from './context/AuthContext';
import './App.css';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import RecipeGenerator from './pages/RecipeGenerator';
import MyRecipes from './pages/MyRecipes';
import RecipeDetail from './pages/RecipeDetail';
import ShoppingList from './pages/ShoppingList';
import Settings from './pages/Settings';
import MealPlanner from './pages/MealPlanner';
import SocialPage from './pages/SocialPage';
import ChallengesPage from './pages/ChallengesPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import MarketplaceHub from './pages/Marketplace/MarketplaceHub';
import CreateListing from './pages/Marketplace/CreateListing';
import ListingDetails from './pages/Marketplace/ListingDetails';
import PurchaseHistory from './pages/Marketplace/PurchaseHistory';
import WishlistPage from './pages/Marketplace/WishlistPage';

function OwnProfileRoute() {
  const { user } = useAuth();

  if (!user?.id) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to={`/profile/${user.id}`} replace />;
}

function App() {
  return (
    <main className="app-shell max-w-8xl mx-auto">
      <AuthProvider>
        <Router>

          <div className="device-shell">
            <ClickSpark className="app-frame">
              <RouteSceneAnimator />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
                <Route path="/generate" element={<ProtectedRoute><RecipeGenerator /></ProtectedRoute>} />
                <Route path="/recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
                <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
                <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
                <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/social" element={<ProtectedRoute><SocialPage /></ProtectedRoute>} />
                <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />
                <Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
                <Route path="/collections/:collectionId" element={<ProtectedRoute><CollectionDetailPage /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/marketplace" element={<ProtectedRoute><MarketplaceHub /></ProtectedRoute>} />
                <Route path="/marketplace/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                <Route path="/marketplace/item/:id" element={<ProtectedRoute><ListingDetails /></ProtectedRoute>} />
                <Route path="/marketplace/purchases" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
                <Route path="/marketplace/wishlists" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><OwnProfileRoute /></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ClickSpark>
          </div>
        </Router>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.82)',
              color: '#101828',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: '1.2rem',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
            },
            success: {
              iconTheme: {
                primary: '#784BA0',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#FF3CAC',
                secondary: '#ffffff'
              }
            }
          }}
        />
      </AuthProvider>
    </main>
  );
}

export default App;
