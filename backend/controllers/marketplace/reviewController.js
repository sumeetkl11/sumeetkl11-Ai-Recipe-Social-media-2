import { pool } from '../../config/db.js';

export const addReview = async (req, res) => {
    try {
        const { target_id, target_type, rating, comment } = req.body;
        const reviewerId = req.user.id;

        const result = await pool.query(
            `INSERT INTO reviews (reviewer_id, target_id, target_type, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [reviewerId, target_id, target_type, rating, comment]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getReviews = async (req, res) => {
    try {
        const { target_id, target_type } = req.query;
        
        const result = await pool.query(
            `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.id
             WHERE r.target_id = $1 AND r.target_type = $2
             ORDER BY r.created_at DESC`,
            [target_id, target_type]
        );
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
