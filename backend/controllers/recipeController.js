import Recipe from "../models/Recipe.js";
import PantryItem from "../models/PantryItem.js";
import { 
    generateRecipe as generateRecipeFromAI,
    generatePantrySuggestions as generatePantrySuggestionsAI,
    generateRecipeImage } from "../utils/gemini.js";
import { calculateRecipeNutrition, validateAndMergeNutrition } from "../utils/nutrition.js";

const defaultRecipes = [
    {
        name: 'Sunrise Shakshuka Skillet',
        description: 'Eggs poached in a smoky tomato-pepper sauce with warm spices and herbs.',
        cuisine_type: 'Mediterranean',
        difficulty: 'medium',
        prep_time: 12,
        cook_time: 24,
        servings: 4,
        instructions: [
            'Warm olive oil in a wide skillet over medium heat. Cook diced onion and red bell pepper until soft and lightly golden.',
            'Stir in garlic, smoked paprika, cumin, chili flakes, and tomato paste. Cook for 1 minute until fragrant.',
            'Add crushed tomatoes, season with salt and pepper, and simmer until the sauce thickens slightly.',
            'Make four wells in the sauce and crack an egg into each one. Cover and cook until the whites are set and the yolks are still slightly soft.',
            'Finish with feta, parsley, and a squeeze of lemon. Serve with toasted bread or warm flatbread.'
        ],
        dietary_tags: ['vegetarian', 'high-protein'],
        image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
            { name: 'Eggs', quantity: 4, unit: 'count' },
            { name: 'Crushed tomatoes', quantity: 2, unit: 'cups' },
            { name: 'Red bell pepper', quantity: 1, unit: 'count' },
            { name: 'Onion', quantity: 1, unit: 'count' },
            { name: 'Feta cheese', quantity: 0.5, unit: 'cup' }
        ],
        nutrition: { calories: 320, protein: 18, carbs: 14, fat: 21, fiber: 4 }
    },
    {
        name: 'Coconut Lime Chicken Bowls',
        description: 'Juicy chicken with jasmine rice, snap peas, and a silky coconut-lime glaze.',
        cuisine_type: 'Thai',
        difficulty: 'easy',
        prep_time: 15,
        cook_time: 20,
        servings: 4,
        instructions: [
            'Season chicken thighs with salt, pepper, and a little curry powder. Sear until browned and cooked through, then slice.',
            'In the same pan, saute garlic and ginger for 30 seconds. Add coconut milk, lime zest, lime juice, and a spoonful of soy sauce.',
            'Simmer the sauce until glossy. Add snap peas and cook just until bright and crisp-tender.',
            'Return the sliced chicken to the pan and toss to coat in the sauce.',
            'Serve over warm jasmine rice with cilantro and toasted sesame seeds.'
        ],
        dietary_tags: ['gluten-free'],
        image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
            { name: 'Chicken thighs', quantity: 700, unit: 'g' },
            { name: 'Coconut milk', quantity: 1, unit: 'can' },
            { name: 'Jasmine rice', quantity: 2, unit: 'cups cooked' },
            { name: 'Snap peas', quantity: 2, unit: 'cups' },
            { name: 'Lime', quantity: 2, unit: 'count' }
        ],
        nutrition: { calories: 490, protein: 31, carbs: 28, fat: 27, fiber: 3 }
    },
    {
        name: 'Roasted Tomato Basil Rigatoni',
        description: 'A cozy pasta layered with blistered tomatoes, basil, and a velvet parmesan finish.',
        cuisine_type: 'Italian',
        difficulty: 'easy',
        prep_time: 10,
        cook_time: 30,
        servings: 4,
        instructions: [
            'Roast cherry tomatoes with olive oil, garlic, salt, and pepper until bursting and lightly caramelized.',
            'Cook rigatoni in salted water until al dente. Reserve a cup of pasta water before draining.',
            'Transfer the roasted tomatoes to a skillet and mash some of them to create a rustic sauce.',
            'Add the pasta, a splash of reserved pasta water, butter, parmesan, and torn basil. Toss until glossy.',
            'Serve with extra basil, black pepper, and more parmesan.'
        ],
        dietary_tags: ['vegetarian'],
        image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
            { name: 'Rigatoni', quantity: 400, unit: 'g' },
            { name: 'Cherry tomatoes', quantity: 500, unit: 'g' },
            { name: 'Parmesan', quantity: 1, unit: 'cup' },
            { name: 'Fresh basil', quantity: 1, unit: 'cup' },
            { name: 'Garlic cloves', quantity: 4, unit: 'count' }
        ],
        nutrition: { calories: 540, protein: 19, carbs: 66, fat: 21, fiber: 5 }
    },
    {
        name: 'Maple Harissa Salmon Traybake',
        description: 'Roasted salmon with sweet-spicy glaze, tender vegetables, and bright citrus notes.',
        cuisine_type: 'American',
        difficulty: 'medium',
        prep_time: 12,
        cook_time: 22,
        servings: 4,
        instructions: [
            'Whisk harissa paste, maple syrup, olive oil, lemon juice, salt, and pepper into a quick glaze.',
            'Arrange salmon fillets, baby potatoes, and broccoli on a lined tray. Toss the vegetables with olive oil and seasoning.',
            'Roast until the potatoes begin to soften, then brush the salmon with glaze and continue roasting until cooked through.',
            'Broil for 1 to 2 minutes at the end for extra caramelization if desired.',
            'Serve with lemon wedges and a spoonful of yogurt or herby sauce.'
        ],
        dietary_tags: ['high-protein', 'pescatarian'],
        image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
        ingredients: [
            { name: 'Salmon fillets', quantity: 4, unit: 'count' },
            { name: 'Baby potatoes', quantity: 500, unit: 'g' },
            { name: 'Broccoli florets', quantity: 3, unit: 'cups' },
            { name: 'Harissa paste', quantity: 2, unit: 'tbsp' },
            { name: 'Maple syrup', quantity: 1, unit: 'tbsp' }
        ],
        nutrition: { calories: 460, protein: 34, carbs: 26, fat: 24, fiber: 4 }
    }
];

export const ensureDefaultRecipesForUser = async (userId) => {
    const existingRecipes = await Recipe.findByUserId(userId, {
        limit: 1,
        offset: 0
    });

    if (existingRecipes.length > 0) {
        return existingRecipes;
    }

    for (const recipeData of defaultRecipes) {
        await Recipe.create(userId, recipeData);
    }

    return Recipe.findByUserId(userId, {
        limit: 20,
        offset: 0
    });
};


// generate pantry suggestions using AI
export const generatePantrySuggestions = async (req, res, next) => {
    try {
        const { 
            ingredients = [],
            usePantryIngredients = false,
            dietaryRestrictions = [],
            cuisineType = 'any',
            servings = 4,
            cookingTime = 'medium'
        } = req.body;

        let finalIngredients = [...ingredients];
        let pantryItems = [];

        if (usePantryIngredients) {
            pantryItems = await PantryItem.findByUserId(req.user.id);
            const pantryIngredientNames = pantryItems.map(item => item.name);
            finalIngredients = [...new Set([...finalIngredients, ...pantryIngredientNames])];
        }

        if (finalIngredients.length === 0 && pantryItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide at least one ingredient' 
            });
        }
        
        const recipe = await generateRecipeFromAI({
            ingredients: finalIngredients,
            pantryItems: pantryItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category
            })),
            dietaryRestrictions, 
            cuisine: cuisineType, 
            servings, 
            cookingTime
        });

        // Calculate nutrition from ingredients
        const nutritionResult = calculateRecipeNutrition(
            recipe.ingredients || [],
            recipe.servings || servings
        );

        // Merge calculated nutrition with AI estimate
        const finalNutrition = validateAndMergeNutrition(
            nutritionResult,
            recipe.nutrition || {}
        );

        // Generate image in parallel (non-blocking fallback)
        const imageUrl = await generateRecipeImage(
            recipe.name,
            recipe.description,
            recipe.cuisineType || cuisineType
        );

        res.json({
            success: true,
            message: 'Recipe generated successfully',
            data: { 
                recipe: { 
                    ...recipe, 
                    nutrition: finalNutrition,
                    image_url: imageUrl 
                } 
            }
        });

    } catch (error) {
        if (error?.status === 429 || /quota|429/i.test(error?.message || '')) {
            return res.status(429).json({
                success: false,
                message: 'AI quota exhausted \u2014 please try again in about 15 minutes.'
            });
        }
        next(error);
    }
};

// get smart pantry suggestions
export const getSmartPantrySuggestions = async (req, res, next) => {
    try {
        const pantryItems = await PantryItem.findByUserId(req.user.id);
        const expiringItems = await PantryItem.getExpiringSoon(req.user.id);

        const expiringNames = expiringItems.map(item => item.name);
        const suggestions = await generatePantrySuggestionsAI(pantryItems, expiringNames);

        res.json({
            success: true,
            data: { suggestions }
        });
    } catch (error) {
        next(error);
    }
};

// Save recipe
export const saveRecipe = async (req, res, next) => {
    try {

        const recipeData = {
            ...req.body,
            prep_time: Math.round(parseFloat(req.body.prepTime || req.body.prep_time || 0)),
            cook_time: Math.round(parseFloat(req.body.cookTime || req.body.cook_time || 0)),
            servings: parseInt(req.body.servings) || 4,
            ingredients: (req.body.ingredients || []).map(ing => ({
                name: ing.name || ing.ingredient_name || '',  // ✅ handle both field names
                quantity: ing.quantity || 1,
                unit: ing.unit || 'unit'
            }))
        };

        const recipe = await Recipe.create(req.user.id, recipeData);
        
        res.status(201).json({
            success: true,
            message: 'Recipe saved successfully',
            data: { recipe }
        });
    } catch (error) {
        next(error);
    }
};
// get all recipes
export const getAllRecipes = async (req, res, next) => {
    try {
        const { search, 
            cuisine_type, 
            difficulty,
            dietary_tag, 
            max_cook_time,
            sort_by,
            sort_order,
            limit, 
            offset 
        } = req.query;

        await ensureDefaultRecipesForUser(req.user.id);

        const recipes = await Recipe.findByUserId(req.user.id, {
            search,
            cuisine_type,
            difficulty,
            dietary_tag,
            max_cook_time: max_cook_time ? parseInt(max_cook_time) : undefined,
            sort_by,
            sort_order,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        });
        
        // Get stats for dashboard
        const stats = await Recipe.getStats(req.user.id);
        
        res.json({
            success: true,
            data: { recipes, stats }
        });
    } catch (error) {
        next(error);
    }
};

// get recent recipes
export const getRecentRecipes = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const recipes = await Recipe.getRecent(req.user.id, limit);
    
        res.json({
            success: true,
            data: { recipes }
        });
    } catch (error) {
        next(error);
    }
};

// get recipe by id
export const getRecipeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.findById(id, req.user.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }
        
        res.json({
            success: true,
            data: { recipe }
        });
    } catch (error) {
        next(error);
    }
};

// update recipe
export const updateRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.update(id, req.user.id, req.body);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Recipe updated successfully',
            data: { recipe }
        });
    } catch (error) {
        next(error);
    }
};

// delete recipe
export const deleteRecipe = async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.delete(id, req.user.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Recipe deleted successfully',
            data: { recipe }
        });
    } catch (error) {
        next(error);
    }
};

// get recipe stats
export const getRecipeStats = async (req, res, next) => {
    try {
        const stats = await Recipe.getStats(req.user.id);
    
        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        next(error);
    }
};

// regenerate recipe with variations
export const regenerateRecipe = async (req, res, next) => {
    try {
        const {
            ingredients = [],
            pantryItems = [],
            dietaryRestrictions = [],
            cuisineType = 'any',
            servings = 4,
            cookingTime = 'medium',
            previousRecipe = null,
            attemptNumber = 1
        } = req.body;

        if (ingredients.length === 0 && pantryItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one ingredient'
            });
        }

        // Fetch fresh pantry items if needed
        let fullPantryItems = pantryItems;
        if (req.body.usePantryIngredients && pantryItems.length === 0) {
            const dbPantryItems = await PantryItem.findByUserId(req.user.id);
            fullPantryItems = dbPantryItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category
            }));
        }

        const recipe = await generateRecipeFromAI({
            ingredients,
            pantryItems: fullPantryItems,
            dietaryRestrictions,
            cuisine: cuisineType,
            servings,
            cookingTime,
            regenerate: true,
            previousRecipe,
            attemptNumber
        });

        // Calculate nutrition from ingredients
        const nutritionResult = calculateRecipeNutrition(
            recipe.ingredients || [],
            recipe.servings || servings
        );

        // Merge calculated nutrition with AI estimate
        const finalNutrition = validateAndMergeNutrition(
            nutritionResult,
            recipe.nutrition || {}
        );

        const imageUrl = await generateRecipeImage(
            recipe.name,
            recipe.description,
            recipe.cuisineType || cuisineType
        );

        res.json({
            success: true,
            message: 'Recipe regenerated successfully',
            data: { 
                recipe: { 
                    ...recipe, 
                    nutrition: finalNutrition,
                    image_url: imageUrl 
                }, 
                attemptNumber 
            }
        });

    } catch (error) {
        if (error?.status === 429 || /quota|429/i.test(error?.message || '')) {
            return res.status(429).json({
                success: false,
                message: 'AI quota exhausted — please try again in about 15 minutes.'
            });
        }
        next(error);
    }
};
