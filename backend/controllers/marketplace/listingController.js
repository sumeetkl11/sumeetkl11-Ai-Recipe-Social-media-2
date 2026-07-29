import { pool } from '../../config/db.js';

export const createListing = async (req, res) => {
    try {
        const { title, category, price, condition, image_url } = req.body;
        const sellerId = req.user.id;

        const result = await pool.query(
            `INSERT INTO marketplace_listings (seller_id, title, category, price, condition, image_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [sellerId, title, category, price, condition, image_url]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getListings = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.*, u.name as seller_name, u.avatar_url as seller_avatar
             FROM marketplace_listings m
             JOIN users u ON m.seller_id = u.id
             WHERE m.status = 'active'
             ORDER BY m.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getListing = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT m.*, u.name as seller_name, u.avatar_url as seller_avatar
             FROM marketplace_listings m
             JOIN users u ON m.seller_id = u.id
             WHERE m.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
