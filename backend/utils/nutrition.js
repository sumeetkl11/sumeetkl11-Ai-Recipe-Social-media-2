import dotenv from 'dotenv';

dotenv.config();

// ─── In-Memory Nutrition Database (Top 200 Common Ingredients) ────────────────

const NUTRITION_DB = {
    // Proteins (per 100g)
    'egg': { calories: 143, protein: 13, carbs: 1, fat: 10, fiber: 0 },
    'eggs': { calories: 143, protein: 13, carbs: 1, fat: 10, fiber: 0 },
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    'chicken': { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0 },
    'beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
    'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
    'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    'tuna': { calories: 130, protein: 28, carbs: 0, fat: 1, fiber: 0 },
    'shrimp': { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
    'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
    'turkey': { calories: 189, protein: 29, carbs: 0, fat: 7, fiber: 0 },
    'bacon': { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0 },
    
    // Dairy (per 100g/100ml)
    'milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
    'cream': { calories: 340, protein: 2.1, carbs: 2.8, fat: 36, fiber: 0 },
    'heavy cream': { calories: 340, protein: 2.1, carbs: 2.8, fat: 36, fiber: 0 },
    'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
    'cheddar cheese': { calories: 403, protein: 23, carbs: 3.1, fat: 33, fiber: 0 },
    'mozzarella': { calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0 },
    'parmesan': { calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0 },
    'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
    'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
    'greek yogurt': { calories: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 },
    
    // Grains & Carbs (per 100g dry/raw)
    'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    'brown rice': { calories: 123, protein: 2.6, carbs: 26, fat: 0.9, fiber: 1.8 },
    'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
    'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
    'flour': { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
    'all-purpose flour': { calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7 },
    'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
    'oats': { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 },
    'couscous': { calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4 },
    
    // Vegetables (per 100g)
    'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    'tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
    'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
    'onions': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
    'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
    'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1 },
    'potatoes': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.1 },
    'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
    'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
    'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
    'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
    'bell pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
    'cucumber': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
    'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
    'mushroom': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
    'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
    'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
    'eggplant': { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },
    'cauliflower': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
    'cabbage': { calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
    'kale': { calories: 49, protein: 4.3, carbs: 9, fat: 0.9, fiber: 2 },
    'asparagus': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1 },
    'celery': { calories: 14, protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6 },
    'corn': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4, fiber: 2 },
    'peas': { calories: 81, protein: 5, carbs: 14, fat: 0.4, fiber: 5 },
    'green beans': { calories: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 2.7 },
    
    // Fruits (per 100g)
    'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
    'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
    'strawberries': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
    'blueberry': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
    'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
    'avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 6.7 },
    'lemon': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8 },
    'lime': { calories: 30, protein: 0.7, carbs: 11, fat: 0.2, fiber: 2.8 },
    'grape': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
    'grapes': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
    'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
    'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
    
    // Oils & Fats (per 100ml/100g)
    'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    'vegetable oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    'oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
    
    // Legumes & Nuts (per 100g)
    'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
    'black beans': { calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7 },
    'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
    'kidney beans': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4 },
    'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
    'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
    'peanuts': { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5 },
    'cashews': { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 },
    
    // Condiments & Spices (per 100g)
    'salt': { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    'pepper': { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25 },
    'black pepper': { calories: 251, protein: 10, carbs: 64, fat: 3.3, fiber: 25 },
    'sugar': { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
    'honey': { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2 },
    'soy sauce': { calories: 53, protein: 5.6, carbs: 4.9, fat: 0.1, fiber: 0.8 },
    'vinegar': { calories: 21, protein: 0, carbs: 0.9, fat: 0, fiber: 0 },
    'mustard': { calories: 66, protein: 3.7, carbs: 5.3, fat: 3.3, fiber: 3 },
    'ketchup': { calories: 101, protein: 1.2, carbs: 25, fat: 0.1, fiber: 0.3 },
    'mayonnaise': { calories: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0 },
    
    // Herbs & Aromatics (per 100g - typically used in small amounts)
    'basil': { calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6, fiber: 1.6 },
    'parsley': { calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3 },
    'cilantro': { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 },
    'thyme': { calories: 101, protein: 5.6, carbs: 24, fat: 1.7, fiber: 14 },
    'oregano': { calories: 265, protein: 9, carbs: 69, fat: 4.3, fiber: 43 },
    'rosemary': { calories: 131, protein: 3.3, carbs: 20, fat: 5.9, fiber: 14 },
    'ginger': { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
    'chili': { calories: 40, protein: 1.9, carbs: 9, fat: 0.4, fiber: 1.5 },
    'paprika': { calories: 282, protein: 14, carbs: 54, fat: 13, fiber: 35 },
};

// ─── Unit Conversion Helper ────────────────────────────────────────────────────

const UNIT_CONVERSIONS = {
    // Weight to grams
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 1000,
    'kilogram': 1000,
    'kilograms': 1000,
    'oz': 28.35,
    'ounce': 28.35,
    'ounces': 28.35,
    'lb': 453.592,
    'pound': 453.592,
    'pounds': 453.592,
    
    // Volume to ml (with density approximations)
    'ml': 1,
    'milliliter': 1,
    'milliliters': 1,
    'l': 1000,
    'liter': 1000,
    'liters': 1000,
    'cup': 240,  // ml
    'cups': 240,
    'tbsp': 15,  // ml
    'tablespoon': 15,
    'tablespoons': 15,
    'tsp': 5,    // ml
    'teaspoon': 5,
    'teaspoons': 5,
    
    // Count-based (approximate weights for common items)
    'large': 50,  // e.g., 1 large egg ≈ 50g
    'medium': 40,
    'small': 30,
    'piece': 100,
    'pieces': 100,
    'whole': 150,
    'clove': 3,   // garlic clove
    'cloves': 3,
    'unit': 100,
    'units': 100,
};

// ─── Calculate Ingredient Nutrition ────────────────────────────────────────────

const convertToGrams = (quantity, unit) => {
    const normalizedUnit = (unit || 'unit').toLowerCase().trim();
    const conversion = UNIT_CONVERSIONS[normalizedUnit];
    
    if (!conversion) {
        // Unknown unit, assume grams
        return quantity;
    }
    
    return quantity * conversion;
};

const findNutritionData = (ingredientName) => {
    const normalized = ingredientName.toLowerCase().trim();
    
    // Direct match
    if (NUTRITION_DB[normalized]) {
        return NUTRITION_DB[normalized];
    }
    
    // Partial match (e.g., "diced tomatoes" matches "tomatoes")
    for (const [key, value] of Object.entries(NUTRITION_DB)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }
    
    return null;
};

// ─── Main Calculation Function ─────────────────────────────────────────────────

export const calculateRecipeNutrition = (ingredients, servings = 4) => {
    let totalNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
    };
    
    let calculatedCount = 0;
    let estimatedCount = 0;
    
    for (const ingredient of ingredients) {
        const { name, quantity = 1, unit = 'unit' } = ingredient;
        
        // Find nutrition data
        const nutritionData = findNutritionData(name);
        
        if (nutritionData) {
            // Convert ingredient quantity to grams
            const gramsAmount = convertToGrams(parseFloat(quantity), unit);
            
            // Calculate nutrition (database values are per 100g)
            const multiplier = gramsAmount / 100;
            
            totalNutrition.calories += Math.round(nutritionData.calories * multiplier);
            totalNutrition.protein += Math.round(nutritionData.protein * multiplier);
            totalNutrition.carbs += Math.round(nutritionData.carbs * multiplier);
            totalNutrition.fat += Math.round(nutritionData.fat * multiplier);
            totalNutrition.fiber += Math.round(nutritionData.fiber * multiplier);
            
            calculatedCount++;
        } else {
            // Ingredient not in database, will use AI estimate
            estimatedCount++;
        }
    }
    
    // If we have any calculated values, use them
    // Otherwise return null to signal AI should estimate
    if (calculatedCount === 0) {
        return {
            nutrition: null,
            calculatedIngredients: 0,
            totalIngredients: ingredients.length,
            method: 'ai-estimated'
        };
    }
    
    // Calculate per-serving values
    const perServing = {
        calories: Math.round(totalNutrition.calories / servings),
        protein: Math.round(totalNutrition.protein / servings),
        carbs: Math.round(totalNutrition.carbs / servings),
        fat: Math.round(totalNutrition.fat / servings),
        fiber: Math.round(totalNutrition.fiber / servings)
    };
    
    return {
        nutrition: perServing,
        totalNutrition,
        calculatedIngredients: calculatedCount,
        totalIngredients: ingredients.length,
        method: estimatedCount > 0 ? 'hybrid' : 'calculated'
    };
};

// ─── Validate and Merge with AI Estimates ──────────────────────────────────────

export const validateAndMergeNutrition = (calculatedNutrition, aiNutrition) => {
    // If we have fully calculated nutrition, prefer it
    if (calculatedNutrition.method === 'calculated') {
        return {
            ...calculatedNutrition.nutrition,
            method: 'calculated',
            confidence: 'high'
        };
    }
    
    // If hybrid, use calculated as base and AI for validation
    if (calculatedNutrition.method === 'hybrid' && calculatedNutrition.nutrition) {
        return {
            ...calculatedNutrition.nutrition,
            method: 'hybrid',
            confidence: 'medium'
        };
    }
    
    // Fall back to AI estimate
    return {
        ...aiNutrition,
        method: 'ai-estimated',
        confidence: 'low'
    };
};

export default {
    calculateRecipeNutrition,
    validateAndMergeNutrition,
    NUTRITION_DB,
    UNIT_CONVERSIONS
};
