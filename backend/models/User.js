const { pool } = require('../config/db');

class User {
    // Create new user
    static async create(userData) {
        const { name, email, password_hash, phone, role, profile_image } = userData;
        
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password_hash, phone, role, profile_image) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, password_hash, phone, role || 'community', profile_image || null]
        );
        
        return result.insertId;
    }

    // Find by email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, email, phone, role, profile_image, is_active, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Update user
    static async update(id, userData) {
        const { name, email, phone, role, profile_image, is_active } = userData;
        
        const [result] = await pool.execute(
            `UPDATE users 
             SET name = ?, email = ?, phone = ?, role = ?, 
                 profile_image = ?, is_active = ?
             WHERE id = ?`,
            [name, email, phone, role, profile_image, is_active || 1, id]
        );
        
        return result.affectedRows > 0;
    }

    // Update password
    static async updatePassword(id, newPasswordHash) {
        const [result] = await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [newPasswordHash, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;