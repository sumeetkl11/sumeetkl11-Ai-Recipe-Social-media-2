import db, { pool } from "../config/db.js";

class MealPlan {

    //  add recipe to meal plan
    static async create (userId, mealData) {
        const {recipeId, planned_date, meal_type, meal_date} = mealData;
        const data = planned_date || meal_date;

        const result = await pool.query(
            `INSERT INTO meal_plans (user_id, recipe_id, meal_date, meal_type, meal_data) 
            VALUES ($1, $2, $3::date, $4, $3::date) 
            RETURNING *`,
            [userId, recipeId, data, meal_type]
        );
        
        return result.rows[0];
    }

    static async findbyDataRange (userId, startDate, endDate) {
        const result = await pool.query(
            `SELECT mp.id, mp.user_id, mp.recipe_id, mp.meal_date::text as meal_date, 
            mp.meal_type, mp.created_at, mp.updated_at, 
            r.name as recipe_name, r.image_url, r.prep_time, r.cook_time 
             FROM meal_plans mp
             JOIN recipes r ON mp.recipe_id = r.id
             WHERE mp.user_id = $1 
             AND mp.meal_date BETWEEN $2 AND $3
             ORDER BY mp.meal_date ASC,
             CASE mp.meal_type
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
             END`,
            [userId, startDate, endDate]
        );
        
        return result.rows;
    }

    // GET WEEKLY MEAL PLAN
    static async getWeeklyMealPlan (userId, weekStartdate) {
        const endDate = new Date(weekStartdate);
        endDate.setDate(endDate.getDate() + 6);
        
        return this.findbyDataRange(userId, weekStartdate, endDate);
    }

    // get upcoming meals (next 7 days)
    static async getUpcomingMeals (userId, limit = 5) {
        const result = await pool.query(
            `SELECT mp.*, r.name as recipe_name, r.image_url
             FROM meal_plans mp
             JOIN recipes r ON mp.recipe_id = r.id
             WHERE mp.user_id = $1 
             AND mp.meal_date >= CURRENT_DATE
             ORDER BY mp.meal_date ASC,
             CASE mp.meal_type
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
             END
             LIMIT $2`,
            [userId, limit]
        );
        
        return result.rows;
    }

    // dlt meal plan entry

    static async delete(id, userId) {
        const result = await pool.query(
            `DELETE FROM meal_plans WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        
        return result.rows[0];
    }

    // get meal plan stats 

    static async getStats(userId) {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_planned_meals,
                COUNT(*) FILTER (WHERE meal_date >= CURRENT_DATE AND meal_date < CURRENT_DATE + INTERVAL '7 days') as this_week_count
             FROM meal_plans 
             WHERE user_id = $1`,
            [userId]
        );
        
        return result.rows[0];
    }
}

export default MealPlan;