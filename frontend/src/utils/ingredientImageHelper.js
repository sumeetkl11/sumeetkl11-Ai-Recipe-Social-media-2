import { INGREDIENT_IMAGES, CATEGORY_FALLBACKS, DEFAULT_FALLBACK } from '../data/ingredientImages';

// Simple cache to avoid repeated string processing
const imageCache = new Map();

/**
 * Get the best matching image URL for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @param {string} category - Category of the ingredient (Vegetables, Fruits, etc.)
 * @returns {string} URL of the ingredient image
 */
export const getIngredientImage = (ingredientName, category = 'Other') => {
  if (!ingredientName) {
    return CATEGORY_FALLBACKS[category] || DEFAULT_FALLBACK;
  }

  // Check cache first
  const cacheKey = `${ingredientName}-${category}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // Normalize the ingredient name: lowercase, trim
  const normalized = ingredientName.toLowerCase().trim();

  // Try exact match first
  if (INGREDIENT_IMAGES[normalized]) {
    imageCache.set(cacheKey, INGREDIENT_IMAGES[normalized]);
    return INGREDIENT_IMAGES[normalized];
  }

  // Try to find partial match (e.g., "cherry tomatoes" matches "tomato")
  const partialMatch = Object.keys(INGREDIENT_IMAGES).find(key => {
    return normalized.includes(key) || key.includes(normalized);
  });

  if (partialMatch) {
    const url = INGREDIENT_IMAGES[partialMatch];
    imageCache.set(cacheKey, url);
    return url;
  }

  // Try handling plurals: remove 's' or 'es' at the end
  const singular = normalized.replace(/s$/, '').replace(/es$/, '');
  if (INGREDIENT_IMAGES[singular]) {
    imageCache.set(cacheKey, INGREDIENT_IMAGES[singular]);
    return INGREDIENT_IMAGES[singular];
  }

  // Fallback to category-specific image
  const fallback = CATEGORY_FALLBACKS[category] || DEFAULT_FALLBACK;
  imageCache.set(cacheKey, fallback);
  return fallback;
};

/**
 * Preload an image to improve loading experience
 * @param {string} url - URL of the image to preload
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Get category icon as fallback for Simple View mode
 * @param {string} category - Category name
 * @returns {string} Emoji representing the category
 */
export const getCategoryEmoji = (category) => {
  const emojiMap = {
    'Vegetables': '🥬',
    'Fruits': '🍎',
    'Dairy': '🥛',
    'Proteins': '🍗',
    'Grains': '🌾',
    'Spices': '🌶️',
    'Other': '🥫'
  };
  return emojiMap[category] || '🥫';
};

