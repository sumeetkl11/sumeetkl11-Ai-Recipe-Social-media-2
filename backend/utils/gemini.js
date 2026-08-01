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
    ingredients = [],
    pantryItems = [],
    dietaryRestrictions = [],
    cuisine = 'any',
    servings = 4,
    cookingTime = 'medium',
    regenerate = false,
    previousRecipe = null,
    attemptNumber = 1
}) => {
    const dietaryInfo = dietaryRestrictions.length > 0
        ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}`
        : 'No dietary restrictions';

    const timeGuide = {
        quick: 'under 30 minutes',
        medium: '30-60 minutes',
        long: 'over 60 minutes'
    };

    // Build pantry context with quantities
    let pantryContext = '';
    if (pantryItems.length > 0) {
        pantryContext = '\n\nPantry items available (use these quantities as guidance):\n';
        pantryContext += pantryItems.map(item => 
            `- ${item.name}: ${item.quantity} ${item.unit || 'unit(s)'}`
        ).join('\n');
    }

    // Regeneration guidance
    let regenerationPrompt = '';
    if (regenerate && previousRecipe) {
        regenerationPrompt = `\n\nThis is regeneration attempt #${attemptNumber}. Previous recipe was "${previousRecipe.name}". 
Create a DIFFERENT recipe with a unique approach. Vary the cooking method, flavor profile, or presentation style.`;
    }

    const systemPrompt = 'You are a professional chef. Return ONLY valid JSON. No markdown, no code fences, no comments.';

    const userPrompt = `Generate a detailed recipe with the following requirements:
Ingredients to use: ${ingredients.length > 0 ? ingredients.join(', ') : 'Use pantry items'}${pantryContext}
${dietaryInfo}
Cuisine type: ${cuisine}
Servings: ${servings}
Cooking time: ${timeGuide[cookingTime] || 'any'}${regenerationPrompt}

IMPORTANT INSTRUCTIONS:
1. In the "instructions" array, include SPECIFIC QUANTITIES from the ingredients list in each step where ingredients are used.
   Example: "Crack 2 large eggs into the ramekin" NOT "Crack eggs into the ramekin"
   Example: "Add 1 cup of milk and 2 tablespoons of butter" NOT "Add milk and butter"

2. Make sure EVERY instruction step that mentions an ingredient includes its specific quantity and unit.

3. Calculate nutrition values accurately based on the ingredient quantities. Consider:
   - Standard USDA values for common ingredients
   - Cooking method impacts (e.g., absorbed oil during frying)
   - Per-serving breakdown (total nutrition / servings)

Return a JSON object with EXACTLY these fields:
{
  "name": "Recipe Name",
  "description": "Brief description of the dish",
  "cuisineType": "${cuisine}",
  "difficulty": "Easy|Medium|Hard",
  "prepTime": 15,
  "cookTime": 30,
  "servings": ${servings},
  "ingredients": [
    { "name": "ingredient name", "quantity": 2, "unit": "large" }
  ],
  "instructions": [
    "Preheat oven to 375°F (190°C). Butter 2 ramekins.",
    "Crack 2 large eggs into each buttered ramekin.",
    "Add 2 tablespoons of cream and season with 1/4 teaspoon salt and 1/8 teaspoon pepper."
  ],
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
