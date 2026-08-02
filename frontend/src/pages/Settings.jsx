import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true); 

    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });

    // Preferences state
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric'
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => { 
        try {
            const response = await api.get('/user/profile');
            const { user, preferences: userPrefs } = response.data.data;
            setProfile({
                name: user.name,
                email: user.email
            });

            if (userPrefs) {
                setPreferences({
                    dietary_restrictions: userPrefs.dietary_restrictions || [],
                    allergies: userPrefs.allergies || [],
                    preferred_cuisines: userPrefs.preferred_cuisines || [],
                    default_servings: userPrefs.default_servings || 4,
                    measurement_unit: userPrefs.measurement_unit || 'metric'
                });
            }
        } catch (error) {
            console.error('Error loading user data:');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/users/profile', profile);
            toast.success('Profile updated successfully');
            // update local stroage
            const updatesUser = {...user, ...profile};
            localStorage.setItem('user', JSON.stringify(updatesUser)); 
        } catch (error) {
            console.error('Error updating profile:');
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        
        try {
            await api.put('/users/preferences', preferences);
            toast.success('Preferences updated successfully');
        } catch (error) {
            console.error('Error updating preferences:');
        }finally {
            setSaving(false); 
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            await api.put('/users/change-password',{
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
             });
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation !== 'DELETE') {
            toast.error('Account deletion cancelled');
            return;
        }

        try {
            await api.delete('/users/account');
            toast.success('Account deleted successfully');
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Error deleting account:');
        }
    };

    const toggleDietary = (option) => {
        setPreferences(prev => ({
            ...prev,
            dietary_restrictions: prev.dietary_restrictions.includes(option)
                ? prev.dietary_restrictions.filter(d => d !== option)
                : [...prev.dietary_restrictions, option]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setPreferences(prev => ({
            ...prev,
            preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
                ? prev.preferred_cuisines.filter(c => c !== cuisine)
                : [...prev.preferred_cuisines, cuisine]
        }));
    };

    return (
        <div className="page-bg min-h-screen">
            <Navbar />

            <div className="mx-auto px-4 py-8 sm:px-6 max-w-4xl relative">
                {/* Decorative blobs behind main container */}
                <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
                <div className="absolute top-[40%] left-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

                {/* Header */}
                <div className="page-hero glass-panel mb-8 rounded-[32px] p-8 overflow-hidden relative shadow-lg shadow-amber-500/5">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-display text-slate-900">Settings</h1>
                            <p className="text-slate-600 mt-2 font-medium">Manage your account and preferences</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="glass-card bg-white/40 border border-white/60 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                                <User className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none backdrop-blur-sm transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/40 bg-white/20 text-slate-500 outline-none cursor-not-allowed backdrop-blur-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md shadow-orange-500/20 border border-transparent"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>


                    {/* Change Password Section */}
                    <div className="glass-card bg-white/40 border border-white/60 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                                <Lock className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none backdrop-blur-sm transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none backdrop-blur-sm transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none backdrop-blur-sm transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md shadow-blue-500/20 border border-transparent"
                            >
                                <Lock className="w-4 h-4" />
                                {saving ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    {/* Preferences Section */}
                    <div className="glass-card bg-white/40 border border-white/60 p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">Dietary Preferences</h2>

                        <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                            {/* Dietary Restrictions */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(option => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleDietary(option)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${preferences.dietary_restrictions.includes(option)
                                                ? 'bg-amber-500 text-white shadow-amber-500/20'
                                                : 'bg-white/50 border border-white/60 text-slate-700 hover:bg-white/80'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">Allergies (comma-separated)</label>
                                <input
                                    type="text"
                                    value={preferences.allergies.join(', ')}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                    })}
                                    placeholder="e.g., peanuts, shellfish, soy"
                                    className="w-full px-4 py-2.5 rounded-xl border border-white/60 bg-white/50 text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none backdrop-blur-sm transition-all"
                                />
                            </div>

                            {/* Preferred Cuisines */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">Preferred Cuisines</label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map(cuisine => (
                                        <button
                                            key={cuisine}
                                            type="button"
                                            onClick={() => toggleCuisine(cuisine)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${preferences.preferred_cuisines.includes(cuisine)
                                                ? 'bg-amber-500 text-white shadow-amber-500/20'
                                                : 'bg-white/50 border border-white/60 text-slate-700 hover:bg-white/80'
                                                }`}
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Default Servings */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">
                                    Default Servings: <span className="text-amber-600">{preferences.default_servings}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={preferences.default_servings}
                                    onChange={(e) => setPreferences({ ...preferences, default_servings: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-200/50 rounded-lg appearance-none cursor-pointer accent-amber-500 backdrop-blur-sm"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                                    <span>1</span>
                                    <span>12</span>
                                </div>
                            </div>

                            {/* Measurement Unit */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">Measurement Unit</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPreferences({ ...preferences, measurement_unit: 'metric' })}
                                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${preferences.measurement_unit === 'metric'
                                            ? 'bg-amber-500 text-white shadow-amber-500/20'
                                            : 'bg-white/50 border border-white/60 text-slate-700 hover:bg-white/80'
                                            }`}
                                    >
                                        Metric (kg, L)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreferences({ ...preferences, measurement_unit: 'imperial' })}
                                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm ${preferences.measurement_unit === 'imperial'
                                            ? 'bg-amber-500 text-white shadow-amber-500/20'
                                            : 'bg-white/50 border border-white/60 text-slate-700 hover:bg-white/80'
                                            }`}
                                    >
                                        Imperial (lb, gal)
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md shadow-orange-500/20 border border-transparent"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </form>
                    </div>


                    {/* Danger Zone */}
                    <div className="glass-card bg-red-50/40 border border-red-200/60 p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100/80 rounded-lg flex items-center justify-center border border-red-200">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Danger Zone</h2>
                        </div>

                        <p className="text-slate-600 mb-6 font-medium">
                            Once you delete your account, there is no going back. All your recipes, meal plans, and data will be permanently deleted.
                        </p>

                        <button
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-medium transition-transform hover:scale-105 active:scale-95 shadow-md shadow-red-500/20 border border-transparent"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
