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

export default defaultRecipes;
