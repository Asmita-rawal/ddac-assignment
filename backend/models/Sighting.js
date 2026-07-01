const { pool } = require('../config/db');

class Sighting {
    // Create new sighting
    static async create(data) {
        const {
            report_id, user_id, description, location,
            latitude, longitude, sighting_time, image_url
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO sightings 
             (report_id, user_id, description, location,
              latitude, longitude, sighting_time, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [report_id, user_id, description, location,
             latitude, longitude, sighting_time || new Date(), image_url]
        );
        
        return result.insertId;
    }

    // Get all sightings with details
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT s.*, 
                   r.elderly_id,
                   e.name as elderly_name,
                   u.name as user_name,
                   r.description as report_description
            FROM sightings s
            LEFT JOIN reports r ON s.report_id = r.id
            LEFT JOIN elderly e ON r.elderly_id = e.id
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.sighting_time DESC
        `);
        return rows;
    }

    // Find sighting by ID
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT s.*, 
                   r.elderly_id,
                   e.name as elderly_name,
                   u.name as user_name
            FROM sightings s
            LEFT JOIN reports r ON s.report_id = r.id
            LEFT JOIN elderly e ON r.elderly_id = e.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `, [id]);
        return rows[0];
    }

    // Get sightings by report
    static async findByReport(reportId) {
        const [rows] = await pool.execute(`
            SELECT s.*, u.name as user_name
            FROM sightings s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.report_id = ?
            ORDER BY s.sighting_time DESC
        `, [reportId]);
        return rows;
    }

    // Get sightings by user
    static async findByUser(userId) {
        const [rows] = await pool.execute(`
            SELECT s.*, 
                   r.elderly_id,
                   e.name as elderly_name
            FROM sightings s
            LEFT JOIN reports r ON s.report_id = r.id
            LEFT JOIN elderly e ON r.elderly_id = e.id
            WHERE s.user_id = ?
            ORDER BY s.sighting_time DESC
        `, [userId]);
        return rows;
    }

    // Get recent sightings
    static async findRecent(limit = 10) {
        const [rows] = await pool.execute(`
            SELECT s.*, 
                   e.name as elderly_name,
                   u.name as user_name
            FROM sightings s
            LEFT JOIN reports r ON s.report_id = r.id
            LEFT JOIN elderly e ON r.elderly_id = e.id
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.sighting_time DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }

    // Confirm sighting
    static async confirm(id) {
        const [result] = await pool.execute(
            'UPDATE sightings SET is_confirmed = 1 WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Update sighting
    static async update(id, data) {
        const {
            description, location, latitude, longitude,
            sighting_time, image_url, is_confirmed
        } = data;

        const [result] = await pool.execute(
            `UPDATE sightings 
             SET description = ?, location = ?,
                 latitude = ?, longitude = ?,
                 sighting_time = ?, image_url = ?, is_confirmed = ?
             WHERE id = ?`,
            [description, location, latitude, longitude,
             sighting_time, image_url, is_confirmed, id]
        );
        
        return result.affectedRows > 0;
    }

    // Delete sighting
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM sightings WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get statistics
    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_confirmed = 1 THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN is_confirmed = 0 THEN 1 ELSE 0 END) as unconfirmed,
                COUNT(DISTINCT report_id) as unique_reports
            FROM sightings
        `);
        return rows[0];
    }
}

module.exports = Sighting;