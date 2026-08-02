// Comprehensive Marketplace Product Catalog
// Connected to local images in src/assets/images/pantry-images
// Products without local images have been removed as requested

export const MARKETPLACE_PRODUCTS = [
  // ==================== VEGETABLES ====================
  { id: 1, name: "Tomato", category: "Vegetables", price: 80, originalPrice: 100, discount: "20%", unit: "kg", expiryDate: "2026-08-09", inStock: true, seller: "Fresh Farm Co.", rating: 4.5, reviews: 234 },
  { id: 2, name: "Onion", category: "Vegetables", price: 50, originalPrice: 50, discount: null, unit: "kg", expiryDate: "2026-08-20", inStock: true, seller: "Local Farmers", rating: 4.3, reviews: 189 },
  { id: 3, name: "Potato", category: "Vegetables", price: 40, originalPrice: 50, discount: "20%", unit: "kg", expiryDate: "2026-08-25", inStock: true, seller: "Fresh Farm Co.", rating: 4.6, reviews: 312 },
  { id: 4, name: "Carrot", category: "Vegetables", price: 70, originalPrice: 70, discount: null, unit: "kg", expiryDate: "2026-08-15", inStock: true, seller: "Organic Valley", rating: 4.4, reviews: 156 },
  { id: 5, name: "Cucumber", category: "Vegetables", price: 60, originalPrice: 75, discount: "20%", unit: "kg", expiryDate: "2026-08-08", inStock: true, seller: "Green Gardens", rating: 4.2, reviews: 98 },
  { id: 6, name: "Bell Pepper", category: "Vegetables", price: 100, originalPrice: 120, discount: "15%", unit: "kg", expiryDate: "2026-08-12", inStock: true, seller: "Fresh Farm Co.", rating: 4.7, reviews: 201 },
  { id: 7, name: "Broccoli", category: "Vegetables", price: 120, originalPrice: 150, discount: "20%", unit: "kg", expiryDate: "2026-08-10", inStock: true, seller: "Organic Valley", rating: 4.5, reviews: 143 },
  { id: 8, name: "Spinach", category: "Vegetables", price: 90, originalPrice: 100, discount: "10%", unit: "bunch", expiryDate: "2026-08-07", inStock: true, seller: "Green Gardens", rating: 4.6, reviews: 178 },
  { id: 9, name: "Cabbage", category: "Vegetables", price: 55, originalPrice: 55, discount: null, unit: "piece", expiryDate: "2026-08-18", inStock: true, seller: "Local Farmers", rating: 4.3, reviews: 87 },
  { id: 11, name: "Garlic", category: "Vegetables", price: 150, originalPrice: 150, discount: null, unit: "kg", expiryDate: "2026-09-15", inStock: true, seller: "Spice Market", rating: 4.8, reviews: 289 },
  { id: 12, name: "Mushroom", category: "Vegetables", price: 180, originalPrice: 200, discount: "10%", unit: "pack", expiryDate: "2026-08-09", inStock: true, seller: "Organic Valley", rating: 4.5, reviews: 134 },
  { id: 13, name: "Zucchini", category: "Vegetables", price: 95, originalPrice: 110, discount: "13%", unit: "kg", expiryDate: "2026-08-11", inStock: true, seller: "Green Gardens", rating: 4.3, reviews: 76 },
  { id: 14, name: "Celery", category: "Vegetables", price: 85, originalPrice: 85, discount: null, unit: "bunch", expiryDate: "2026-08-10", inStock: true, seller: "Fresh Farm Co.", rating: 4.2, reviews: 62 },
  { id: 15, name: "Lettuce", category: "Vegetables", price: 75, originalPrice: 90, discount: "15%", unit: "piece", expiryDate: "2026-08-08", inStock: true, seller: "Organic Valley", rating: 4.4, reviews: 93 },
  { id: 16, name: "Green Chili", category: "Vegetables", price: 120, originalPrice: 120, discount: null, unit: "kg", expiryDate: "2026-08-14", inStock: true, seller: "Spice Market", rating: 4.6, reviews: 157 },
  { id: 17, name: "Eggplant", category: "Vegetables", price: 85, originalPrice: 100, discount: "15%", unit: "kg", expiryDate: "2026-08-12", inStock: true, seller: "Local Farmers", rating: 4.3, reviews: 89 },
  { id: 18, name: "Peas", category: "Vegetables", price: 95, originalPrice: 110, discount: "13%", unit: "kg", expiryDate: "2026-08-11", inStock: true, seller: "Green Gardens", rating: 4.5, reviews: 112 },
  { id: 19, name: "Corn", category: "Vegetables", price: 75, originalPrice: 75, discount: null, unit: "pack", expiryDate: "2026-08-13", inStock: true, seller: "Fresh Farm Co.", rating: 4.4, reviews: 128 },

  // ==================== FRUITS ====================
  { id: 107, name: "Pineapple", category: "Fruits", price: 80, originalPrice: 80, discount: null, unit: "piece", expiryDate: "2026-08-15", inStock: true, seller: "Tropical Harvest", rating: 4.7, reviews: 156 },
  { id: 108, name: "Lemon", category: "Fruits", price: 70, originalPrice: 70, discount: null, unit: "kg", expiryDate: "2026-08-25", inStock: true, seller: "Citrus Grove", rating: 4.4, reviews: 178 },
  { id: 112, name: "Pomegranate", category: "Fruits", price: 180, originalPrice: 200, discount: "10%", unit: "kg", expiryDate: "2026-08-20", inStock: true, seller: "Fruit Paradise", rating: 4.6, reviews: 167 },

  // ==================== PROTEINS ====================
  { id: 205, name: "Shrimp", category: "Proteins", price: 480, originalPrice: 550, discount: "12%", unit: "kg", expiryDate: "2026-08-04", inStock: true, seller: "Ocean Catch", rating: 4.7, reviews: 156 },
  { id: 207, name: "Beef", category: "Proteins", price: 420, originalPrice: 480, discount: "12%", unit: "kg", expiryDate: "2026-08-05", inStock: true, seller: "Fresh Meat Co.", rating: 4.6, reviews: 312 },
  { id: 208, name: "Pork", category: "Proteins", price: 350, originalPrice: 400, discount: "12%", unit: "kg", expiryDate: "2026-08-05", inStock: true, seller: "Fresh Meat Co.", rating: 4.5, reviews: 198 },
  { id: 209, name: "Turkey", category: "Proteins", price: 380, originalPrice: 420, discount: "10%", unit: "kg", expiryDate: "2026-08-06", inStock: true, seller: "Fresh Meat Co.", rating: 4.7, reviews: 145 },
  { id: 210, name: "Bacon", category: "Proteins", price: 320, originalPrice: 360, discount: "11%", unit: "pack", expiryDate: "2026-08-15", inStock: true, seller: "Fresh Meat Co.", rating: 4.8, reviews: 267 },

  // ==================== DAIRY ====================
  { id: 300, name: "Milk", category: "Dairy", price: 60, originalPrice: 60, discount: null, unit: "liter", expiryDate: "2026-08-08", inStock: true, seller: "Dairy Fresh", rating: 4.7, reviews: 534 },
  { id: 302, name: "Yogurt", category: "Dairy", price: 50, originalPrice: 60, discount: "15%", unit: "pack", expiryDate: "2026-08-12", inStock: true, seller: "Dairy Fresh", rating: 4.6, reviews: 289 },
  { id: 304, name: "Cream", category: "Dairy", price: 85, originalPrice: 100, discount: "15%", unit: "pack", expiryDate: "2026-08-10", inStock: true, seller: "Dairy Fresh", rating: 4.5, reviews: 167 },
  { id: 305, name: "Cheddar", category: "Dairy", price: 220, originalPrice: 250, discount: "12%", unit: "pack", expiryDate: "2026-08-28", inStock: true, seller: "Cheese Factory", rating: 4.8, reviews: 198 },
  { id: 308, name: "Sour Cream", category: "Dairy", price: 95, originalPrice: 110, discount: "13%", unit: "pack", expiryDate: "2026-08-15", inStock: true, seller: "Dairy Fresh", rating: 4.4, reviews: 134 },
  { id: 309, name: "Heavy Cream", category: "Dairy", price: 110, originalPrice: 130, discount: "15%", unit: "pack", expiryDate: "2026-08-12", inStock: true, seller: "Dairy Fresh", rating: 4.6, reviews: 156 },

  // ==================== GRAINS ====================
  { id: 403, name: "Flour", category: "Grains", price: 50, originalPrice: 50, discount: null, unit: "kg", expiryDate: "2026-12-31", inStock: true, seller: "Grain Depot", rating: 4.6, reviews: 534 },
  { id: 405, name: "Quinoa", category: "Grains", price: 280, originalPrice: 320, discount: "12%", unit: "kg", expiryDate: "2027-04-20", inStock: true, seller: "Health Store", rating: 4.7, reviews: 234 },
  { id: 406, name: "Couscous", category: "Grains", price: 180, originalPrice: 200, discount: "10%", unit: "pack", expiryDate: "2027-02-28", inStock: true, seller: "Grain Depot", rating: 4.5, reviews: 167 },
  { id: 407, name: "Cereal", category: "Grains", price: 150, originalPrice: 180, discount: "15%", unit: "box", expiryDate: "2026-12-31", inStock: true, seller: "Health Store", rating: 4.6, reviews: 289 },
  { id: 408, name: "Noodles", category: "Grains", price: 70, originalPrice: 80, discount: "12%", unit: "pack", expiryDate: "2027-01-31", inStock: true, seller: "Asian Market", rating: 4.5, reviews: 312 },

  // ==================== SPICES ====================
  { id: 502, name: "Olive Oil", category: "Spices", price: 320, originalPrice: 380, discount: "15%", unit: "bottle", expiryDate: "2027-06-30", inStock: true, seller: "Gourmet Oils", rating: 4.9, reviews: 512 },
  { id: 504, name: "Soy Sauce", category: "Spices", price: 95, originalPrice: 110, discount: "13%", unit: "bottle", expiryDate: "2027-10-31", inStock: true, seller: "Asian Market", rating: 4.6, reviews: 312 },
  { id: 506, name: "Sugar", category: "Spices", price: 45, originalPrice: 50, discount: "10%", unit: "kg", expiryDate: "2027-12-31", inStock: true, seller: "Sweet Supplies", rating: 4.5, reviews: 389 },
  { id: 510, name: "Oregano", category: "Spices", price: 120, originalPrice: 140, discount: "15%", unit: "pack", expiryDate: "2027-12-31", inStock: true, seller: "Herb Garden", rating: 4.5, reviews: 178 },
  { id: 511, name: "Basil", category: "Spices", price: 95, originalPrice: 110, discount: "13%", unit: "pack", expiryDate: "2026-08-20", inStock: true, seller: "Herb Garden", rating: 4.7, reviews: 201 },
  { id: 512, name: "Parsley", category: "Spices", price: 85, originalPrice: 100, discount: "15%", unit: "bunch", expiryDate: "2026-08-15", inStock: true, seller: "Herb Garden", rating: 4.4, reviews: 156 },
  { id: 513, name: "Thyme", category: "Spices", price: 110, originalPrice: 130, discount: "15%", unit: "pack", expiryDate: "2027-12-31", inStock: true, seller: "Herb Garden", rating: 4.6, reviews: 189 },
];

// Category statistics calculated dynamically
export const MARKETPLACE_CATEGORIES = [
  { id: 'all', name: 'All Items', count: MARKETPLACE_PRODUCTS.length },
  { id: 'Vegetables', name: 'Vegetables', count: MARKETPLACE_PRODUCTS.filter(p => p.category === 'Vegetables').length },
  { id: 'Fruits', name: 'Fruits', count: MARKETPLACE_PRODUCTS.filter(p => p.category === 'Fruits').length },
  { id: 'Proteins', name: 'Proteins', count: MARKETPLACE_PRODUCTS.filter(p => p.category === 'Proteins').length },
  { id: 'Dairy', name: 'Dairy', count: MARKETPLACE_PRODUCTS.filter(p => p.category === 'Dairy').length },
  { id: 'Grains', name: 'Grains', count: MARKETPLACE_PRODUCTS.filter(p => p.category === 'Grains').length },
  { id: 'Spices', name: 'Spices & Herbs', count: MARKETPLACE_PRODUCTS.filter(p => p.category === 'Spices').length },
];
