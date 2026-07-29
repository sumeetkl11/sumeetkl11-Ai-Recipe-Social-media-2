import { pool } from '../../config/db.js';

export const getWishlists = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT * FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching wishlists:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createWishlist = async (req, res) => {
    try {
        const { name, visibility } = req.body;
        const userId = req.user.id;

        const result = await pool.query(
            `INSERT INTO wishlists (user_id, name, visibility)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, name, visibility || 'private']
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error creating wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getWishlistItems = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT wi.*, m.title, m.price, m.image_url, m.status
             FROM wishlist_items wi
             JOIN marketplace_listings m ON wi.product_id = m.id
             WHERE wi.wishlist_id = $1
             ORDER BY wi.created_at DESC`,
            [id]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const addWishlistItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_id, price_tracked } = req.body;

        const result = await pool.query(
            `INSERT INTO wishlist_items (wishlist_id, product_id, price_tracked)
             VALUES ($1, $2, $3)
             ON CONFLICT (wishlist_id, product_id) DO NOTHING
             RETURNING *`,
            [id, product_id, price_tracked]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error adding item to wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
