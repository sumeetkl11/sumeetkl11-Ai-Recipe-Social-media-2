import dotenv from 'dotenv';

dotenv.config();

// ─── Helpers ────────────────────────────────────────────────────────────────

const stripMarkdownCodeFence = (text) => {
    let cleanedText = text.trim();

    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?|```/g, '').replace(/```\n?|```/g, '');
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?|```/g, '');
    }

    return cleanedText.trim();
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

        throw new Error('AI returned non-JSON content');
    }
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

// ─── Groq chat helper ────────────────────────────────────────────────────────

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const groqChat = async (systemPrompt, userPrompt) => {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured');

    const attempt = async () => {
        const res = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7
            })
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            const err = new Error(`Groq API error ${res.status}: ${detail.slice(0, 200)}`);
            err.status = res.status;
            throw err;
        }

        const data = await res.json();
        return extractJsonPayload(data.choices[0].message.content);
    };

    // Simple retry: max 2 attempts on 429 or 5xx, wait 2s then 4s
    const delays = [2000, 4000];
    for (let i = 0; i <= 1; i++) {
        try {
            return await attempt();
        } catch (err) {
            const retryable = err.status === 429 || (err.status >= 500 && err.status < 600);
            if (retryable && i < 1) {
                console.warn(`Groq ${err.status} — retrying in ${delays[i]}ms`);
                await sleep(delays[i]);
            } else {
                throw err;
            }
        }
    }
};

// ─── Exports ─────────────────────────────────────────────────────────────────

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

    const systemPrompt = 'You are a professional chef. Return ONLY valid JSON. No markdown, no code fences, no comments.';

    const userPrompt = `Generate a detailed recipe with the following requirements:
Ingredients available: ${ingredients.join(', ')}
${dietaryInfo}
Cuisine type: ${cuisine}
Servings: ${servings}
Cooking time: ${timeGuide[cookingTime] || 'any'}

Return a JSON object with EXACTLY these fields:
{
  "name": "Recipe Name",
  "description": "Brief description of the dish",
  "cuisineType": "${cuisine}",
  "difficulty": "Easy",
  "prepTime": 15,
  "cookTime": 30,
  "servings": ${servings},
  "ingredients": [
    { "name": "ingredient name", "quantity": 1, "unit": "cup" }
  ],
  "instructions": ["Step 1", "Step 2"],
  "nutrition": {
    "calories": 400,
    "protein": 20,
    "carbs": 45,
    "fat": 15,
    "fiber": 5
  },
  "cookingTips": ["Tip 1", "Tip 2"]
}
All numeric fields (prepTime, cookTime, servings, nutrition values) must be numbers, not strings.
Make the recipe creative, delicious, and use the provided ingredients effectively!`;

    try {
        const recipe = await groqChat(systemPrompt, userPrompt);
        return normalizeRecipe(recipe, cuisine, servings);
    } catch (error) {
        console.error('Groq API Error (generateRecipe):', error);
        throw error;
    }
};

export const generatePantrySuggestions = async (pantryItem, expiringitems = []) => {
    const Ingredients = pantryItem.map(item => item.name).join(', ');
    const expiringText = expiringitems.length > 0
        ? `\nPriority ingredients (expiring soon): ${expiringitems.join(', ')}` : '';

    const systemPrompt = 'You are a professional chef. Return ONLY valid JSON. No markdown, no code fences.';
    const userPrompt = `Based on these available ingredients: ${Ingredients}${expiringText}
Suggest 3 creative recipe ideas that use these ingredients.
Return ONLY this JSON object:
{"suggestions": ["Recipe idea 1 (1-2 sentences)", "Recipe idea 2 (1-2 sentences)", "Recipe idea 3 (1-2 sentences)"]}`;

    try {
        const result = await groqChat(systemPrompt, userPrompt);
        return result.suggestions;
    } catch (error) {
        console.error('Groq API Error (generatePantrySuggestions):', error);
        throw error;
    }
};

export const generateCookingTips = async (recipe) => {
    const systemPrompt = 'You are a professional chef. Return ONLY valid JSON. No markdown, no code fences.';
    const userPrompt = `For this recipe: "${recipe.name}"
Ingredients: ${recipe.ingredients?.map(i => i.name).join(', ') || 'N/A'}
Provide 3-5 helpful cooking tips to make this recipe better.
Return ONLY this JSON object:
{"tips": ["Tip 1", "Tip 2", "Tip 3"]}`;

    try {
        const result = await groqChat(systemPrompt, userPrompt);
        return result.tips;
    } catch (error) {
        console.error('Groq API Error (generateCookingTips):', error);
        throw error;
    }
};

export const generateRecipeImage = async (recipeName, description) => {
    const prompt = `professional food photography of ${recipeName}, ${description || ''}, studio lighting, appetizing, on a plate, high detail`.trim();
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
};

export default {
    generateRecipe,
    generatePantrySuggestions,
    generateCookingTips,
    generateRecipeImage
};
