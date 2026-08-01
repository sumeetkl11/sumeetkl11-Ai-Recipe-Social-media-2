import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X, Calendar, AlertCircle, Trash2, Pencil, Sparkles, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];
const UNITS = ['pieces', 'kg', 'g', 'lbs', 'oz', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'pack', 'can', 'bottle'];

const Pantry = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('expiry');
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

    useEffect(() => {
        void refreshPantry();
    }, [refreshPantry]);

    useEffect(() => {
        filterAndSortItems();
    }, [items, searchQuery, selectedCategory, sortBy]);

    const filterAndSortItems = () => {
        let result = [...items];

        if (searchQuery) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        result.sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === 'category') {
                return (a.category || '').localeCompare(b.category || '');
            }
            // Default: 'expiry' soonest first
            if (!a.expiry_date) return 1;
            if (!b.expiry_date) return -1;
            return new Date(a.expiry_date) - new Date(b.expiry_date);
        });

        setFilteredItems(result);
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

            const deletedIds = new Set();
            for (const item of expiredItems) {
                try {
                    await api.delete(`/pantry/${item.id}`);
                    deletedIds.add(item.id);
                } catch (error) {
                    console.error(`Failed to delete pantry item ${item.id}:`, error);
                }
            }

            if (deletedIds.size > 0) {
                setItems(prevItems => prevItems.filter(item => !deletedIds.has(item.id)));
                await fetchExpiringItems();
                toast.success(`Removed ${deletedIds.size} expired item${deletedIds.size > 1 ? 's' : ''}`);
            } else {
                toast.error('Failed to remove expired items');
            }
        } catch (error) {
            console.error('Error removing expired items:', error);
            toast.error('Error removing expired items');
        } finally {
            setRefreshing(false);
        }
    };

    const handleUseExpiringInRecipe = () => {
        const expiringNames = expiringItems.map(i => i.name);
        navigate('/generate', { state: { ingredients: expiringNames, usePantry: true } });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-bg min-h-screen">
            <Navbar />

            <div className="mx-auto px-4 py-8 sm:px-6 max-w-7xl">
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
                    <div className="glass-card mb-6 rounded-[28px] p-4 border border-amber-300/50 bg-amber-500/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-medium text-amber-900">Items Expiring Soon</h3>
                                    <p className="text-sm text-amber-800 mt-0.5">
                                        {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring within 7 days ({expiringItems.slice(0, 4).map(i => i.name).join(', ')}{expiringItems.length > 4 ? '...' : ''})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleUseExpiringInRecipe}
                                className="cta-button shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold"
                            >
                                <Sparkles className="w-4 h-4" />
                                Cook with Expiring Items
                            </button>
                        </div>
                    </div>
                )}

                {/* Search, Filter, & Sort */}
                <div className="glass-card mb-6 rounded-[28px] p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ingredients..."
                                className="ghost-input w-full rounded-2xl py-3 pl-10 pr-4 outline-none"
                            />
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-2 shrink-0">
                            <ArrowUpDown className="w-4 h-4 text-slate-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-2xl border border-white/20 bg-white/80 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
                            >
                                <option value="expiry">Sort: Expiry Soonest</option>
                                <option value="name">Sort: Name (A-Z)</option>
                                <option value="category">Sort: Category</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filter Buttons */}
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

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map(item => (
                            <PantryItemCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                                onEdit={(itemToEdit) => setEditingItem(itemToEdit)}
                                isExpiring={expiringItems.some(exp => exp.id === item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-[28px] p-12 text-center">
                        <p className="text-gray-500">No pantry items match your search.</p>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchPantryItems();
                        fetchExpiringItems();
                    }}
                />
            )}

            {/* Edit Item Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSuccess={() => {
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

const PantryItemCard = ({ item, onDelete, onEdit, isExpiring }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiryDate = null;
    if (item.expiry_date) {
        expiryDate = new Date(item.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
    }

    const daysUntilExpiry = expiryDate ? Math.round((expiryDate - today) / (1000 * 60 * 60 * 24)) : null;
    const isExpired = expiryDate && expiryDate < today;
    const isAlmostExpiring = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 3 && !isExpired;

    return (
        <div className={`glass-card rounded-[24px] p-4 hover:shadow-md transition-all ${isExpiring ? 'border-amber-300/80 bg-amber-500/5' : 'border-gray-200'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Edit item"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete item"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
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
                            ? 'text-rose-600 font-medium' 
                            : isAlmostExpiring 
                                ? 'text-amber-600 font-medium' 
                                : isExpiring 
                                    ? 'text-amber-500 font-medium' 
                                    : 'text-gray-600'
                            }`}>
                            {isExpired ? 'Expired' : 'Expires'}: {new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                    </div>
                )}

                {item.is_running_low && (
                    <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
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
        
        const parsedQuantity = parseFloat(formData.quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            toast.error('Quantity must be a valid positive number');
            return;
        }

        if (!formData.expiry_date) {
            toast.error('Expiry date is required');
            return;
        }

        setLoading(true);

        try {
            await api.post('/pantry', 
                {
                    ...formData,
                    quantity: parsedQuantity,
                    expiry_date: formData.expiry_date
                }
            );
            toast.success('Item added to pantry');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Add Pantry Item</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Item name (e.g. Tomatoes)"
                            className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="Quantity"
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            >
                                {UNITS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="secondary-button rounded-2xl px-4 py-2.5 text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cta-button rounded-2xl px-5 py-2.5 text-sm font-semibold"
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditItemModal = ({ item, onClose, onSuccess }) => {
    const formatDateForInput = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return dt.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        name: item.name || '',
        quantity: item.quantity || '',
        unit: item.unit || 'pieces',
        category: item.category || 'Other',
        expiry_date: formatDateForInput(item.expiry_date),
        is_running_low: Boolean(item.is_running_low)
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const parsedQuantity = parseFloat(formData.quantity);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            toast.error('Quantity must be a valid positive number');
            return;
        }

        setLoading(true);

        try {
            await api.put(`/pantry/${item.id}`, {
                ...formData,
                quantity: parsedQuantity
            });
            toast.success('Pantry item updated');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Edit Pantry Item</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            >
                                {UNITS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Expiry Date</label>
                            <input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-white/20 bg-white/80 text-slate-900 outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="secondary-button rounded-2xl px-4 py-2.5 text-sm font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="cta-button rounded-2xl px-5 py-2.5 text-sm font-semibold"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pantry;
