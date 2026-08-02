import db, { pool } from '../config/db.js';

class PantryItem {

    // create a new pantry item
    static async create(userId, itemData) {
        const {name, quantity, unit, category, expiry_date, is_running_low = false} = itemData;
        
        const numQuantity = Number(quantity);
        if (!Number.isFinite(numQuantity) || numQuantity <= 0) {
            throw new Error('Quantity must be a positive number');
        }

        const result = await pool.query(
            `INSERT INTO pantry_items 
            (user_id, name, quantity, unit, category, expiry_date, is_running_low) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [userId, name, numQuantity, unit, category, expiry_date, is_running_low]
        );
        return result.rows[0];
    }


    // Get all pantry items for a user
    static async findByUserId(userId, filters = {}) {
        try {
            let query = `SELECT * FROM pantry_items WHERE user_id = $1`;
            const params = [userId];
            let paramCount = 1;

            if (filters.category) {
                paramCount++;
                query += ` AND category = $${paramCount}`;
                params.push(filters.category);
            }

            if (filters.is_running_low !== undefined) {
                paramCount++;
                query += ` AND is_running_low = $${paramCount}`;
                params.push(filters.is_running_low);
            }

            if (filters.search) {
                paramCount++;
                query += ` AND name ILIKE $${paramCount}`;
                params.push(`%${filters.search}%`);
            }

            query += ` ORDER BY created_at DESC`;
            
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('[PantryItem.findByUserId] Database query failed:', {
                error: error.message,
                code: error.code,
                userId,
                filters
            });
            throw error;
        }
    }

    // Get item expiring soon (within 7 days)
    static async getExpiringSoon(userId, days = 7) {
        const safeDays = Math.min(Math.max(parseInt(days) || 7, 1), 30);
        const result = await pool.query(
            `SELECT * FROM pantry_items 
            WHERE user_id = $1 
            AND expiry_date IS NOT NULL 
            AND expiry_date >= CURRENT_DATE
            AND expiry_date <= CURRENT_DATE + INTERVAL '1 day' * $2
            ORDER BY expiry_date ASC
            LIMIT 100`,
            [userId, safeDays]
        );
        return result.rows;
    }

    // Get pantry item by id
    static async findById(id, userId) {
        const result = await pool.query(
            `SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return result.rows[0];
    }

    // update pantry item
    static async update(id, userId, updates) {
        const {name, quantity, unit, category, expiry_date, is_running_low} = updates;
        const sanitizedExpiry = (expiry_date === '' || expiry_date === undefined) ? null : expiry_date;
        
        const result = await pool.query(
            `UPDATE pantry_items 
            SET name = COALESCE($1, name), 
            quantity = COALESCE($2, quantity), 
            unit = COALESCE($3, unit), 
            category = COALESCE($4, category), 
            expiry_date = COALESCE($5, expiry_date), 
            is_running_low = COALESCE($6, is_running_low) 
            WHERE id = $7 AND user_id = $8 
            RETURNING *`,
            [name, quantity, unit, category, sanitizedExpiry, is_running_low, id, userId]
        );
        return result.rows[0];
    }

    // Delete pantry item
    static async delete(id, userId) {
        const result = await pool.query(
            `DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }

    // get pantry stats 
    static async getStats(userId) {
        try {
            const result = await pool.query(
                `SELECT 
                    COUNT(*) as total_items,
                    COUNT(DISTINCT category) as total_categories,
                    COUNT(*) FILTER (WHERE is_running_low = true) as running_low_count,
                    COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND expiry_date >= CURRENT_DATE) as expiring_soon_count
                FROM pantry_items 
                WHERE user_id = $1`,
                [userId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('[PantryItem.getStats] Database query failed:', {
                error: error.message,
                code: error.code,
                detail: error.detail,
                table: error.table,
                column: error.column,
                userId
            });
            throw error;
        }
    }


}

export default PantryItem;





















