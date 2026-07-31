import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import useRevalidateOnFocus from '../hooks/useRevalidateOnFocus';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const Pantry = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPantryItems = useCallback(async () => {
        try {
            const response = await api.get('/pantry');
            setItems(response.data.data.items || []);
        } catch (error) {
            toast.error('Error loading pantry items');
        }
    }, []);

    const fetchExpiringItems = useCallback(async () => {
        try {
            const response = await api.get('/pantry/expiring-soon?days=7');
            setExpiringItems(response.data.data.items || []);
        } catch (error) {
            toast.error('Error loading expiring items');
        }
    }, []);

    const refreshPantry = useCallback(async (options = {}) => {
        const silent = options.silent;

        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            await Promise.all([fetchPantryItems(), fetchExpiringItems()]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fetchExpiringItems, fetchPantryItems]);

    // ponytail: disabled auto-refresh to prevent reload on interaction + reduce rate limit usage
    // useRevalidateOnFocus(() => refreshPantry({ silent: true }));

    useEffect(() => {
        void refreshPantry();
    }, [refreshPantry]);

    useEffect(() => {
        filterItems();
    }, [items, searchQuery, selectedCategory]);

    const filterItems = () => {
        let filtered = items;

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        setFilteredItems(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await api.delete(`/pantry/${id}`);
            setItems(items.filter(item => item.id !== id)); 
            toast.success('Item deleted');
        } catch (error) {
            toast.error('Error deleting item');
        }
    };

    const handleRemoveExpired = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiredItems = items.filter(item => {
            if (!item.expiry_date) return false;
            const expiryDate = new Date(item.expiry_date);
            expiryDate.setHours(0, 0, 0, 0);
            return expiryDate < today;
        });

        if (expiredItems.length === 0) {
            toast.info('No expired items to remove');
            return;
        }

        const confirmed = window.confirm(`Remove ${expiredItems.length} expired item${expiredItems.length > 1 ? 's' : ''}?`);
        if (!confirmed) return;

        try {
            setRefreshing(true);

            const remainingIds = new Set(items.map(item => item.id));
            for (const item of expiredItems) {
                remainingIds.delete(item.id);
                try {
                    await api.delete(`/pantry/${item.id}`);
                } catch (error) {
                    console.error(`Failed to delete pantry item ${item.id}:`, error);
                }
            }

            const nextItems = items.filter(item => remainingIds.has(item.id));
            setItems(nextItems);
            await fetchExpiringItems();
            toast.success(`Removed ${expiredItems.length} expired item${expiredItems.length > 1 ? 's' : ''}`);
        } catch (error) {
            console.error('Error removing expired items:', error);
            toast.error('Error removing expired items');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="px-4 py-8">
                    <div className="glass-panel loading-skeleton h-56 rounded-[32px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-bg min-h-screen">
            <Navbar />

            <div className="mx-auto px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="page-hero glass-panel mb-6 flex flex-col gap-5 rounded-[32px] p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pantry</h1>
                        <p className="mt-1 text-gray-600">Manage your ingredients and track expiry dates</p>
                        {refreshing && (
                            <div className="glass-badge mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Refreshing inventory
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleRemoveExpired}
                            className="secondary-button rounded-2xl px-4 py-2.5 text-sm font-semibold text-rose-600"
                        >
                            <Trash2 className="w-5 h-5" />
                            Remove All Expired
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="cta-button rounded-2xl px-4 py-2.5 text-sm font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Expiring Soon Alert */}
                {expiringItems.length > 0 && (
                    <div className="glass-card mb-6 rounded-[28px] p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-amber-900">Items Expiring Soon</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring within 7 days
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="glass-card mb-6 rounded-[28px] p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ingredients..."
                                className="ghost-input w-full rounded-2xl py-3 pl-10 pr-4 outline-none"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            <CategoryButton
                                label="All"
                                active={selectedCategory === 'All'}
                                onClick={() => setSelectedCategory('All')}
                            />
                            {CATEGORIES.map(category => (
                                <CategoryButton
                                    key={category}
                                    label={category}
                                    active={selectedCategory === category}
                                    onClick={() => setSelectedCategory(category)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <PantryItemCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                                isExpiring={expiringItems.some(exp => exp.id === item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-[28px] p-12 text-center">
                        <p className="text-gray-500">No items found</p>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newItem) => {
                        fetchPantryItems();
                        fetchExpiringItems();
                    }}
                />
            )}
        </div>
    );
};

const CategoryButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`rounded-2xl px-4 py-2.5 font-medium text-sm whitespace-nowrap transition-colors ${active
            ? 'bg-[linear-gradient(45deg,#FF3CAC_0%,#784BA0_50%,#2B86C5_100%)] text-white shadow-[0_14px_28px_rgba(120,75,160,0.2)]'
            : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
    >
        {label}
    </button>
);

const PantryItemCard = ({ item, onDelete, isExpiring }) => {
    // const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
    const today = new Date();
    const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
    const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : null;
    const isExpired = expiryDate && expiryDate < today;
    const isAlmostExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 3 && !isExpired;

    return (
        <div className={`glass-card rounded-[24px] p-4 hover:shadow-md transition-shadow ${isExpiring ? 'border-amber-300' : 'border-gray-200'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                </div>
                <button
                    onClick={() => onDelete(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">
                        {item.quantity} {item.unit}
                    </span>
                </div>

                {item.expiry_date && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={`
                                ${isExpired 
                                ? 'text-red-600 font-medium' 
                                : isAlmostExpiring 
                                    ? 'text-yellow-500 font-medium'   // 2-3 days → yellow
                                    : isExpiring 
                                        ? 'text-amber-600 font-medium' // up to 7 days → amber
                                        : 'text-gray-600'              // normal → gray
                                }`}>
                                {isExpired ? 'Expired' : 'Expires'}: {new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </span>
                        </div>
                    )}

                    {item.is_running_low && (
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                            Running Low
                        </span>
                    )}
            </div>
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other',
        expiry_date: '',
        is_running_low: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate expiry date is required
        if (!formData.expiry_date) {
            toast.error('Expiry date is required');
            return;
        }

        setLoading(true);

        try {
            await api.post('/pantry', 
                {
                    ...formData,
                    quantity: parseInt(formData.quantity),
                    expiry_date: formData.expiry_date
                }
            );
            toast.success('Item added to pantry');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Error adding item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add Pantry Item</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            >
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="cups">Cups</option>
                                <option value="tbsp">Tablespoons</option>
                                <option value="tsp">Teaspoons</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="running-low"
                            checked={formData.is_running_low}
                            onChange={(e) => setFormData({ ...formData, is_running_low: e.target.checked })}
                            className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="running-low" className="text-sm text-gray-700">
                            Mark as running low
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pantry;
