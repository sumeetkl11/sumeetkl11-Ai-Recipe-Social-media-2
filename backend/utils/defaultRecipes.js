import Recipe from '../models/Recipe.js';
import defaultRecipes from '../data/defaultRecipes.js';

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
