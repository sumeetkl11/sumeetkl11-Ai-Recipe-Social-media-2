import Recipe from "../models/Recipe.js";
import PantryItem from "../models/PantryItem.js";
import { 
    generateRecipe as generateRecipeFromAI,
    generatePantrySuggestions as generatePantrySuggestionsAI,
    generateRecipeImage } from "../utils/gemini.js";
import { calculateRecipeNutrition, validateAndMergeNutrition } from "../utils/nutrition.js";
import { ensureDefaultRecipesForUser } from "../utils/defaultRecipes.js";

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
        await ensureDefaultRecipesForUser(req.user.id);
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
