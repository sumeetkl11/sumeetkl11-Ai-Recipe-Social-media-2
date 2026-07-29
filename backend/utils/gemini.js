import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('WARNING: GEMINI_API_KEY is not defined. Ai features will not work.');
}

const ai = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;


const stripMarkdownCodeFence = (text) => {
    let cleanedText = text.trim();

    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?|```/g, '').replace(/```\n?|```/g, '');
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?|```/g, '');
    }

    return cleanedText.trim();
};

const getGeminiModel = () => {
    if (!ai) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    return ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const extractJsonPayload = (text) => {
    const cleanedText = stripMarkdownCodeFence(text);

    try {
        return JSON.parse(cleanedText);
    } catch {
        const objectMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return JSON.parse(objectMatch[0]);
        }

        const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            return JSON.parse(arrayMatch[0]);
        }

        throw new Error('Gemini returned non-JSON content');
    }
};

const generateJson = async (prompt) => {
    const response = await getGeminiModel().generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: 'application/json'
        }
    });

    return extractJsonPayload(response.response.text());
};

const normalizeRecipe = (recipe, requestedCuisine, servings) => ({
    ...recipe,
    cuisineType: recipe.cuisineType || recipe.cuisine_type || requestedCuisine,
    prepTime: Number(recipe.prepTime ?? recipe.prep_time ?? 0),
    cookTime: Number(recipe.cookTime ?? recipe.cook_time ?? 0),
    servings: Number(recipe.servings ?? servings),
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
    cookingTips: Array.isArray(recipe.cookingTips) ? recipe.cookingTips : [],
    nutrition: recipe.nutrition || {}
});

export const generateRecipe = async ({
    ingredients,
    dietaryRestrictions = [],
    cuisine = 'any',
    servings = 4,
    cookingTime = 'medium',
}) => {
    const dietaryInfo = dietaryRestrictions.length > 0 
        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}`
        : 'No dietary restrictions';
    const timeGuide = {
        quick: 'under 30 minutes',
        medium: '30-60 minutes',
        long: 'over 60 minutes'
    };
    
    const prompt = `Generate a detailed recipe with the following requirements:
    Ingredients available: ${ingredients.join(', ')}
    ${dietaryInfo}
    Cuisine type: ${cuisine}
    Servings: ${servings}
    Cooking time: ${timeGuide[cookingTime] || 'any'}

    Please provide a complete recipe in the following JSON format (return ONLY valid JSON, no markdown):
    {
        "name": "Recipe Name",
        "description": "Brief description of the dish",
        "cuisineType": "${cuisine}",
        "difficulty": "Easy|Medium|Hard",
        "prepTime": "number (in minutes)",
        "cookTime": "number (in minutes)",
        "servings": ${servings},
        "ingredients": [
            { "name": "ingredient name", "quantity": 1, "unit": "cup" },
            { "name": "another ingredient", "quantity": 200, "unit": "g" }
        ],
        "instructions": [
            "Step 1 description",
            "Step 2 description"
        ],
        "nutrition": {
            "calories": "number",
            "protein": "number (grams)",
            "carbs": "number (grams)",
            "fat": "number (grams)",
            "fiber": "number (grams)"
        },
        "cookingTips": [
            "Tip 1",
            "Tip 2"
        ]
    }
        Make sure the recipe is creative and delicious and uses the provided ingredients effectively!
    `;

    try {
        const recipe = await generateJson(prompt);
        const normalizedRecipe = normalizeRecipe(recipe, cuisine, servings);
        
        console.log('Generated recipe nutrition:', normalizedRecipe.nutrition);
        
        return normalizedRecipe;   
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(error.message || 'Failed to generate recipe from Gemini API');
    }
};

export const generatePantrySuggestions = async (pantryItem, expiringitems = []) => {
    const Ingredients = pantryItem.map(item => item.name).join(', ');
    const expiringText = expiringitems.length > 0 
    ? `\nPriority ingredients(expiring soon): ${expiringitems.join(', ')}` : '';
    
    const prompt = `Based on these available ingredients: ${Ingredients}${expiringText}
        suggest 3 creative recipe ideas that use these ingredients. Return ONLY a JSON array of string(no markdown):
        ["Recipe idea 1", "Recipe idea 2", "Recipe idea 3"]
        Each suggestion should be a brief, appetizing description of a recipe(1 - 2 sentences).
    `;
    
    try {
        const suggestions = await generateJson(prompt);
        
        return suggestions;   
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(error.message || 'Failed to generate suggestions from Gemini API');
    }
};

export const generateCookingTips = async(recipe) => {
    const prompt = `For this recipe: "${recipe.name}"
    Ingredients: ${recipe.ingredients?.map(i=>i.name).join(', ') || 'N/A'}
        Provide 3-5 helpful cooking tips to make this recipe better.
        Return ONLY a JSON array of string(no markdown):
        ["Tip 1", "Tip 2", "Tip 3"]
    `;

    try {
        const tips = await generateJson(prompt);
        
        return tips;   
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(error.message || 'Failed to generate cooking tips from Gemini API');
    }
};


// Curated high-quality Unsplash food photos by category
const FOOD_IMAGES = {
    pasta: [
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
        'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
        'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80',
    ],
    pizza: [
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
        'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=80',
    ],
    chicken: [
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=800&q=80',
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
        'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800&q=80',
    ],
    beef: [
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
        'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
    ],
    fish: [
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    ],
    salmon: [
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
        'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800&q=80',
    ],
    soup: [
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
        'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=800&q=80',
    ],
    salad: [
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    ],
    rice: [
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    ],
    egg: [
        'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
    ],
    burger: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    ],
    sandwich: [
        'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800&q=80',
        'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80',
    ],
    curry: [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
        'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=800&q=80',
    ],
    tacos: [
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    ],
    sushi: [
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
        'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80',
    ],
    steak: [
        'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    ],
    tomato: [
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    ],
    spinach: [
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    ],
    italian: [
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
        'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80',
    ],
    mexican: [
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
        'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    ],
    indian: [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    ],
    chinese: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    ],
    japanese: [
        'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
        'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80',
    ],
    thai: [
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
        'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80',
    ],
    mediterranean: [
        'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
    ],
    american: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    ],
    french: [
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    ],
    default: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
        'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=80',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    ]
};

const pickImage = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const generateRecipeImage = async (recipeName, description, cuisineType) => {
    const text = `${recipeName} ${description || ''}`.toLowerCase();
    const keywords = Object.keys(FOOD_IMAGES).filter(k => k !== 'default');

    // Match recipe name/description keywords first
    for (const kw of keywords) {
        if (text.includes(kw)) {
            return pickImage(FOOD_IMAGES[kw]);
        }
    }

    // Fall back to cuisine type
    const cuisine = (cuisineType || '').toLowerCase();
    for (const kw of keywords) {
        if (cuisine.includes(kw)) {
            return pickImage(FOOD_IMAGES[kw]);
        }
    }

    return pickImage(FOOD_IMAGES.default);
};

export default{
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips,
    generateRecipeImage
};
