import db, { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';


class User{
    // create new user

    static async create({email, password, name}){
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (email, name, password) 
            VALUES ($1, $2, $3) 
            RETURNING id, email, name, avatar_url, created_at`,
            [email, name, hashedPassword]
        );

        return result.rows[0];
    }

    // find user by email

    static async findOne({email}){
        const result = await pool.query(
            `SELECT id, email, name, avatar_url, password, created_at FROM users WHERE email = $1`,
            [email]
        );

        return result.rows[0];
    }
    
    // find by id
    static async findById(id) {
    const result = await pool.query(
        `SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

    // update basic

    static async update(id, updates){
        const {name, email, avatar_url} = updates;
        const result = await pool.query(
            `UPDATE users 
            SET name = $1, email = $2, avatar_url = $3 
            WHERE id = $4 
            RETURNING id, name, email, avatar_url`,
            [name, email, avatar_url || null, id]
        );
        return result.rows[0];
    }

    // update password for user

    static async updatePassword(id, newPassword){
        const hashed = await bcrypt.hash(newPassword, 10);
        const result = await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2`,
            [hashed, id]
        );
        return result.rowCount > 0;
    }

    // delete user account
    static async delete(id){
        await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    }

    // verify user password

    static async verifyPassword(plainPassword, hashedPassword){
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

export default User;
