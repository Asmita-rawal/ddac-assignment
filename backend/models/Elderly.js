const { pool } = require('../config/db');

class Elderly {
    // Create elderly person
    static async create(data) {
        const {
            user_id, name, age, gender, address,
            contact_person, contact_phone, medical_conditions,
            special_instructions, profile_image
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO elderly 
             (user_id, name, age, gender, address, 
              contact_person, contact_phone, medical_conditions,
              special_instructions, profile_image) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, age, gender, address, 
             contact_person, contact_phone, medical_conditions,
             special_instructions, profile_image]
        );
        
        return result.insertId;
    }

    // Get all elderly with caregiver info
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT e.*, u.name as caregiver_name, u.email as caregiver_email
            FROM elderly e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.is_active = 1
            ORDER BY e.id
        `);
        return rows;
    }

    // Find elderly by ID with full details
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT e.*, u.name as caregiver_name, u.email as caregiver_email, u.phone as caregiver_phone
            FROM elderly e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.id = ?
        `, [id]);
        return rows[0];
    }

    // Find elderly by caregiver
    static async findByCaregiver(userId) {
        const [rows] = await pool.execute(`
            SELECT * FROM elderly 
            WHERE user_id = ? AND is_active = 1
            ORDER BY id
        `, [userId]);
        return rows;
    }

    // Search elderly by name
    static async searchByName(searchTerm) {
        const [rows] = await pool.execute(`
            SELECT e.*, u.name as caregiver_name
            FROM elderly e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.name LIKE ? AND e.is_active = 1
        `, [`%${searchTerm}%`]);
        return rows;
    }

    // Update elderly
    static async update(id, data) {
        const {
            name, age, gender, address,
            contact_person, contact_phone, 
            medical_conditions, special_instructions,
            profile_image, is_active
        } = data;

        const [result] = await pool.execute(
            `UPDATE elderly 
             SET name = ?, age = ?, gender = ?, address = ?,
                 contact_person = ?, contact_phone = ?,
                 medical_conditions = ?, special_instructions = ?,
                 profile_image = ?, is_active = ?
             WHERE id = ?`,
            [name, age, gender, address, contact_person,
             contact_phone, medical_conditions, special_instructions,
             profile_image, is_active, id]
        );
        
        return result.affectedRows > 0;
    }

    // Soft delete (set inactive)
    static async softDelete(id) {
        const [result] = await pool.execute(
            'UPDATE elderly SET is_active = 0 WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Hard delete
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM elderly WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get statistics
    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as males,
                SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as females,
                AVG(age) as avg_age,
                MIN(age) as min_age,
                MAX(age) as max_age
            FROM elderly
            WHERE is_active = 1
        `);
        return rows[0];
    }

    // Get elderly by age range
    static async findByAgeRange(minAge, maxAge) {
        const [rows] = await pool.execute(`
            SELECT e.*, u.name as caregiver_name
            FROM elderly e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.age BETWEEN ? AND ? AND e.is_active = 1
        `, [minAge, maxAge]);
        return rows;
    }
}

module.exports = Elderly;