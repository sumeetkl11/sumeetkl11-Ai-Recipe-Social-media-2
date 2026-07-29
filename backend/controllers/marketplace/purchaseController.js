import { pool } from '../../config/db.js';

export const createPurchase = async (req, res) => {
    try {
        const { item_id, seller_id, quantity, price } = req.body;
        const buyerId = req.user.id;

        const result = await pool.query(
            `INSERT INTO purchases (buyer_id, item_id, seller_id, quantity, price, status)
             VALUES ($1, $2, $3, $4, $5, 'completed')
             RETURNING *`,
            [buyerId, item_id, seller_id, quantity, price]
        );

        // Update listing status if bought
        await pool.query(
            `UPDATE marketplace_listings SET status = 'sold' WHERE id = $1`,
            [item_id]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT p.*, m.title, m.image_url, u.name as seller_name
             FROM purchases p
             LEFT JOIN marketplace_listings m ON p.item_id = m.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE p.buyer_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getSalesHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT p.*, m.title, m.image_url, u.name as buyer_name
             FROM purchases p
             LEFT JOIN marketplace_listings m ON p.item_id = m.id
             LEFT JOIN users u ON p.buyer_id = u.id
             WHERE p.seller_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
