const IMAGE_LIST = [
  'Bacon.jpg', 'Basil.jpg', 'Beef.jpg', 'Celery.jpg', 'Cereal.jpg', 'Cheddar.png',
  'Couscous.jpg', 'Cream.jpg', 'Flour.jpg', 'Green Chili.jpg', 'Lettuce.jpg',
  'Milk.jpg', 'Noodles.jpg', 'Olive Oil.jpg', 'Pineapple.jpg', 'Pomegranate.jpg',
  'Pork.jpg', 'Quinoa.jpg', 'Shrimp.jpg', 'Soy Sauce.jpg', 'Turkey.jpg', 'Yogurt.jpg',
  'Zucchini.jpg', 'bell_pepper.jpg', 'broccoli.jpg', 'cabbage.jpg', 'carrot.jpg',
  'coriander.jpg', 'corn.jpg', 'cucumber.jpg', 'eggplant.jpg', 'garlic.jpg',
  'green_chili.jpg', 'heavy cream.jpg', 'lemon.jpg', 'mushroom.jpg', 'onion.jpg',
  'peas.jpg', 'potato.jpg', 'sour cream.webp', 'spinach.jpg', 'tomato.jpg'
];

export const INGREDIENT_IMAGES = {};

IMAGE_LIST.forEach(fileName => {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const key = nameWithoutExt.replace(/_/g, ' ').toLowerCase().trim();
  const url = `/pantry-images/${fileName}`;
  INGREDIENT_IMAGES[key] = url;

  // Common plurals
  if (key === 'tomato') INGREDIENT_IMAGES['tomatoes'] = url;
  if (key === 'potato') INGREDIENT_IMAGES['potatoes'] = url;
  if (key === 'onion') INGREDIENT_IMAGES['onions'] = url;
  if (key === 'carrot') INGREDIENT_IMAGES['carrots'] = url;
  if (key === 'mushroom') INGREDIENT_IMAGES['mushrooms'] = url;
});

// Category fallback images using available local images
export const CATEGORY_FALLBACKS = {
  'Vegetables': INGREDIENT_IMAGES['spinach'] || INGREDIENT_IMAGES['tomato'],
  'Fruits': INGREDIENT_IMAGES['pineapple'] || INGREDIENT_IMAGES['pomegranate'],
  'Dairy': INGREDIENT_IMAGES['milk'] || INGREDIENT_IMAGES['yogurt'],
  'Proteins': INGREDIENT_IMAGES['beef'] || INGREDIENT_IMAGES['shrimp'],
  'Grains': INGREDIENT_IMAGES['flour'] || INGREDIENT_IMAGES['cereal'],
  'Spices': INGREDIENT_IMAGES['basil'] || INGREDIENT_IMAGES['olive oil'],
  'Other': INGREDIENT_IMAGES['olive oil']
};

// Default fallback if nothing matches
export const DEFAULT_FALLBACK = CATEGORY_FALLBACKS['Other'];
