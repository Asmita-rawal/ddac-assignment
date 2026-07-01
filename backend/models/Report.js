const { pool } = require('../config/db');

class Report {
    // Create new report
    static async create(data) {
        const {
            elderly_id, reporter_id, report_type, description,
            location, latitude, longitude, priority
        } = data;

        const [result] = await pool.execute(
            `INSERT INTO reports 
             (elderly_id, reporter_id, report_type, description,
              location, latitude, longitude, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [elderly_id, reporter_id, report_type, description,
             location, latitude, longitude, priority || 'medium']
        );
        
        return result.insertId;
    }

    // Get all reports with details
    static async findAll() {
        const [rows] = await pool.execute(`
            SELECT r.*, 
                   e.name as elderly_name,
                   u.name as reporter_name,
                   u.email as reporter_email
            FROM reports r
            LEFT JOIN elderly e ON r.elderly_id = e.id
            LEFT JOIN users u ON r.reporter_id = u.id
            ORDER BY r.created_at DESC
        `);
        return rows;
    }

    // Find report by ID with full details
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT r.*, 
                   e.name as elderly_name,
                   u.name as reporter_name,
                   u.email as reporter_email
            FROM reports r
            LEFT JOIN elderly e ON r.elderly_id = e.id
            LEFT JOIN users u ON r.reporter_id = u.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    }

    // Get reports by elderly person
    static async findByElderly(elderlyId) {
        const [rows] = await pool.execute(`
            SELECT r.*, u.name as reporter_name
            FROM reports r
            LEFT JOIN users u ON r.reporter_id = u.id
            WHERE r.elderly_id = ?
            ORDER BY r.created_at DESC
        `, [elderlyId]);
        return rows;
    }

    // Get reports by status
    static async findByStatus(status) {
        const [rows] = await pool.execute(`
            SELECT r.*, e.name as elderly_name
            FROM reports r
            LEFT JOIN elderly e ON r.elderly_id = e.id
            WHERE r.status = ?
            ORDER BY r.priority DESC, r.created_at DESC
        `, [status]);
        return rows;
    }

    // Get active reports
    static async findActive() {
        const [rows] = await pool.execute(`
            SELECT r.*, e.name as elderly_name
            FROM reports r
            LEFT JOIN elderly e ON r.elderly_id = e.id
            WHERE r.status IN ('active', 'investigating')
            ORDER BY r.priority DESC, r.created_at DESC
        `, []);
        return rows;
    }

    // Get reports by priority
    static async findByPriority(priority) {
        const [rows] = await pool.execute(`
            SELECT r.*, e.name as elderly_name
            FROM reports r
            LEFT JOIN elderly e ON r.elderly_id = e.id
            WHERE r.priority = ?
            ORDER BY r.created_at DESC
        `, [priority]);
        return rows;
    }

    // Update report
    static async update(id, data) {
        const {
            report_type, description, location,
            latitude, longitude, status, priority
        } = data;

        const [result] = await pool.execute(
            `UPDATE reports 
             SET report_type = ?, description = ?, location = ?,
                 latitude = ?, longitude = ?, status = ?, priority = ?
             WHERE id = ?`,
            [report_type, description, location,
             latitude, longitude, status, priority, id]
        );
        
        return result.affectedRows > 0;
    }

    // Update status only
    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE reports SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    // Delete report
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM reports WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get statistics
    static async getStats() {
        const [rows] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
                SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
            FROM reports
        `);
        return rows[0];
    }

    // Get reports by date range
    static async findByDateRange(startDate, endDate) {
        const [rows] = await pool.execute(`
            SELECT r.*, e.name as elderly_name
            FROM reports r
            LEFT JOIN elderly e ON r.elderly_id = e.id
            WHERE DATE(r.created_at) BETWEEN ? AND ?
            ORDER BY r.created_at DESC
        `, [startDate, endDate]);
        return rows;
    }
}

module.exports = Report;