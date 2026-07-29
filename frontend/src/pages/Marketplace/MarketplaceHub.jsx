import { useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import { ShoppingBag, Search, Plus, Minus, MapPin, ChevronRight, X } from 'lucide-react';

const STATIC_PRODUCTS = [
  { id: 1, name: "Tomato", price: 80, originalPrice: 100, discount: "20%", expiryDate: "2024-06-20", category: "Vegetables", image: "🍅" },
  { id: 2, name: "Onion", price: 50, originalPrice: 50, discount: null, expiryDate: "2024-07-10", category: "Vegetables", image: "🧅" },
  { id: 3, name: "Cucumber", price: 60, originalPrice: 75, discount: "20%", expiryDate: "2024-06-18", category: "Vegetables", image: "🥒" },
  { id: 4, name: "Carrot", price: 70, originalPrice: 70, discount: null, expiryDate: "2024-06-25", category: "Vegetables", image: "🥕" },
  { id: 5, name: "Potato", price: 40, originalPrice: 50, discount: "20%", expiryDate: "2024-07-15", category: "Vegetables", image: "🥔" },
  { id: 6, name: "Broccoli", price: 120, originalPrice: 150, discount: "20%", expiryDate: "2024-06-19", category: "Vegetables", image: "🥦" },
  { id: 7, name: "Bell Pepper (Red)", price: 100, originalPrice: 120, discount: "15%", expiryDate: "2024-06-22", category: "Vegetables", image: "🫑" },
  { id: 8, name: "Garlic", price: 150, originalPrice: 150, discount: null, expiryDate: "2024-07-20", category: "Spices", image: "🧄" },
  { id: 9, name: "Spinach", price: 90, originalPrice: 100, discount: "10%", expiryDate: "2024-06-17", category: "Vegetables", image: "🥬" },
  { id: 10, name: "Cabbage", price: 55, originalPrice: 55, discount: null, expiryDate: "2024-06-28", category: "Vegetables", image: "🥬" },
  { id: 11, name: "Eggplant", price: 85, originalPrice: 100, discount: "15%", expiryDate: "2024-06-21", category: "Vegetables", image: "🍆" },
  { id: 13, name: "Green Chili", price: 120, originalPrice: 120, discount: null, expiryDate: "2024-06-19", category: "Spices", image: "🌶️" },
  { id: 14, name: "Coriander", price: 60, originalPrice: 80, discount: "25%", expiryDate: "2024-06-16", category: "Herbs", image: "🌿" },
  { id: 16, name: "Lemon", price: 70, originalPrice: 70, discount: null, expiryDate: "2024-06-25", category: "Vegetables", image: "🍋" },
  { id: 18, name: "Peas", price: 95, originalPrice: 110, discount: "13%", expiryDate: "2024-06-20", category: "Vegetables", image: "🟢" },
  { id: 27, name: "Mushroom", price: 180, originalPrice: 200, discount: "10%", expiryDate: "2024-06-19", category: "Vegetables", image: "🍄" },
  { id: 28, name: "Corn", price: 75, originalPrice: 75, discount: null, expiryDate: "2024-06-23", category: "Vegetables", image: "🌽" }
];

const CATEGORIES = [
  { id: 'all', name: 'All Items', count: STATIC_PRODUCTS.length },
  { id: 'vegetables', name: 'Vegetables', count: STATIC_PRODUCTS.filter(p => p.category === 'Vegetables').length },
  { id: 'spices', name: 'Spices', count: STATIC_PRODUCTS.filter(p => p.category === 'Spices').length },
  { id: 'herbs', name: 'Herbs', count: STATIC_PRODUCTS.filter(p => p.category === 'Herbs').length },
  { id: 'dairy', name: 'Dairy', count: 0 },
  { id: 'snacks', name: 'Snacks', count: 0 },
];

export default function MarketplaceHub() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});

  // Derived state
  const filteredProducts = useMemo(() => {
    return STATIC_PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery]);

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Cart actions
  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        ...product,
        quantity: (prev[product.id]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId].quantity > 1) {
        newCart[productId].quantity -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Marketplace Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-700 hover:text-[#d70f64] cursor-pointer font-medium transition-colors">
            <MapPin className="w-5 h-5" />
            <span>Deliver to: Home (123 Main St)</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-100/50 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-[#d70f64]/20 focus:border-[#d70f64] transition-colors"
              placeholder="Search for groceries, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative items-start">
        
        {/* Left Sidebar - Categories */}
        <div className="hidden md:block col-span-2 space-y-1 sticky top-[120px]">
          <h3 className="font-bold text-slate-900 px-3 mb-4 uppercase tracking-wider text-sm">Categories</h3>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-[#d70f64]/10 text-[#d70f64]' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{cat.name}</span>
              {cat.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-[#d70f64]/20 text-[#d70f64]' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Center - Product Grid */}
        <div className="col-span-1 md:col-span-10 lg:col-span-7 pb-24 lg:pb-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeCategory === 'all' ? 'Popular Items' : CATEGORIES.find(c => c.id === activeCategory)?.name}
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-medium text-slate-900">No items found</h3>
              <p className="text-slate-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-3 left-3 z-10 bg-[#d70f64] text-white text-xs font-bold px-2 py-1 rounded-md">
                      {product.discount} OFF
                    </div>
                  )}
                  
                  {/* Image Placeholder (Emoji for now) */}
                  <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                    {product.image}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{product.category}</p>
                    
                    <div className="mt-auto flex items-end justify-between gap-2">
                      <div>
                        {product.discount && (
                          <span className="text-xs text-slate-400 line-through block mb-0.5">Rs. {product.originalPrice}</span>
                        )}
                        <span className="font-bold text-slate-900">Rs. {product.price}</span>
                      </div>
                      
                      {/* Add Button */}
                      {cart[product.id] ? (
                        <div className="flex items-center gap-3 bg-[#d70f64] text-white rounded-full p-1 shadow-sm">
                          <button onClick={() => removeFromCart(product.id)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-bold min-w-[12px] text-center">{cart[product.id].quantity}</span>
                          <button onClick={() => addToCart(product)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-8 h-8 rounded-full bg-slate-100 text-[#d70f64] flex items-center justify-center hover:bg-[#d70f64] hover:text-white transition-colors shadow-sm"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Cart */}
        <div className="hidden lg:block col-span-3 sticky top-[120px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#d70f64]" />
                Your Cart
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">Your cart is empty</p>
                  <p className="text-slate-400 text-xs mt-1">Add items to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        {item.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 truncate">{item.name}</h4>
                        <div className="text-[#d70f64] font-semibold text-sm mt-0.5">Rs. {item.price * item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-white rounded-md transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-3 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-[#d70f64] hover:bg-white rounded-md transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4 text-sm font-medium">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">Rs. {subtotal}</span>
                </div>
                <button className="w-full bg-[#d70f64] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#b00c52] transition-colors shadow-lg shadow-[#d70f64]/30 flex items-center justify-between">
                  <span>Checkout</span>
                  <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">Rs. {subtotal}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Bar (Fixed Bottom) */}
        {cartItems.length > 0 && (
          <div className="lg:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-4 right-4 z-50">
            <button className="w-full bg-[#d70f64] text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-[#d70f64]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {totalItems}
                </div>
                <span>View Cart</span>
              </div>
              <span>Rs. {subtotal}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
