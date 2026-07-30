import MealPlan from '../models/MealPlan.js';

// add recipe to meal plan 
export const addToMealPlan = async (req, res, next) => {
    try {
        const mealPlan = await MealPlan.create(req.user.id, req.body);

        if (req.io && req.user?.id) {
            req.io.to(`user:${req.user.id}:mealplan`).emit('mealplan:update', { action: 'add', mealPlan });
        }

        res
        .status(201)
        .json({
            success: true,
            message: 'Recipe added to meal plan',
            data: {mealPlan}
        });
    } catch (error) {
        next(error);
    }
};

// get weekly meal plan 
export const getWeeklyMealPlan = async (req, res, next) => {
    try {
        const { start_date, weekStartDate } = req.query;
        const startDate = start_date || weekStartDate;

        if (!startDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date is required'
            });
        }
        const mealPlans = await MealPlan.getWeeklyMealPlan(req.user.id, startDate);

        res.json({
            success: true,
            data: {mealPlans}
        });
    } catch (error) {
        next(error);
    }
};

// get upcoming meals 
export const getUpcomingMeals = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const meals = await MealPlan.getUpcomingMeals(req.user.id, limit);
        res.json({
            success: true,
            data: {meals}
        });
    } catch (error) {
        next(error);
    }
};

// dlt meal plan entry 
export const deleteMealPlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mealPlan = await MealPlan.delete(id, req.user.id);

        if (!mealPlan) {
            return res.status(404).json({
                success: false,
                message: 'Meal plan entry not found'
            });
        }

        if (req.io && req.user?.id) {
            req.io.to(`user:${req.user.id}:mealplan`).emit('mealplan:update', { action: 'delete', id });
        }

        res.json({
            success: true,
            message: 'Meal plan entry deleted',
            data: {mealPlan}
        });
    } catch (error) {
        next(error);
    }
};

// get meal plan stats 
export const getMealPlanStats = async (req, res, next) => {
    try {
        const stats = await MealPlan.getStats(req.user.id);
        res.json({
            success: true,
            data: {stats}
        });
    } catch (error) {
        next(error);
    }
};
