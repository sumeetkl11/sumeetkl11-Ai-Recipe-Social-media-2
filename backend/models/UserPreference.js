import db, { pool } from "../config/db.js";

class UserPreference {
    
    // create user preferences

    static async create (userId, preferences) {
        const {
            dietary_restrictions = [],
            allergens = [],              // ✅ was: allergies
            preference_cuisine = [],     // ✅ was: preferred_cuisines
            default_servings = 4,
            measurement_system = 'metric', // ✅ was: measurement_unit
        } = preferences;
        
        const result = await pool.query(
            `INSERT INTO user_preferences
            (user_id, dietary_restrictions, allergens, preference_cuisine, default_servings, measurement_system)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id)
            DO UPDATE SET
            dietary_restrictions = $2,
            allergens = $3,
            preference_cuisine = $4,
            default_servings = $5,
            measurement_system = $6
            RETURNING *`,
            [userId, dietary_restrictions, allergens, preference_cuisine, default_servings, measurement_system]
        );
        
        return result.rows[0];
    }

    // GET user preferences
    static async findByUserId (userId){
        const result = await pool.query(
            `SELECT * FROM user_preferences WHERE user_id = $1`,
            [userId]
        )
        return result.rows[0] || null;
    }

    // Dlt user perferences
    static async delete(userId){
        const result = await pool.query(
            `DELETE FROM user_preferences WHERE user_id = $1`,
            [userId]
        )
    }
}

export default UserPreference;
