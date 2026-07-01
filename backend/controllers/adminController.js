const User = require('../models/User');
const Elderly = require('../models/Elderly');
const Report = require('../models/Report');
const Sighting = require('../models/Sighting');
const { success, error, validationError, notFound } = require('../utils/response');
const db = require('../config/db');

// Get admin dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = await db.getOne('CALL GetAdminStats()');
        
        // Get additional stats
        const recentActivity = await db.getMany(`
            SELECT 
                'user' as type,
                u.name,
                u.created_at,
                'registered' as action
            FROM users u
            ORDER BY u.created_at DESC
            LIMIT 5
        `);
        
        const recentReports = await db.getMany(`
            SELECT 
                'report' as type,
                ep.name,
                mr.created_at,
                mr.status as action
            FROM missing_reports mr
            JOIN elderly_profiles ep ON mr.profile_id = ep.profile_id
            ORDER BY mr.created_at DESC
            LIMIT 5
        `);
        
        const recentSightings = await db.getMany(`
            SELECT 
                'sighting' as type,
                ep.name,
                s.created_at,
                s.status as action
            FROM sightings s
            JOIN missing_reports mr ON s.report_id = mr.report_id
            JOIN elderly_profiles ep ON mr.profile_id = ep.profile_id
            ORDER BY s.created_at DESC
            LIMIT 5
        `);
        
        // Combine and sort recent activity
        const allActivity = [...recentActivity, ...recentReports, ...recentSightings];
        allActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const recent = allActivity.slice(0, 10);
        
        // Get daily stats for chart
        const dailyStats = await db.getMany(`
            SELECT 
                DATE(created_at) as date,
                COUNT(CASE WHEN table_name = 'users' THEN 1 END) as new_users,
                COUNT(CASE WHEN table_name = 'missing_reports' THEN 1 END) as new_reports,
                COUNT(CASE WHEN table_name = 'sightings' THEN 1 END) as new_sightings
            FROM audit_log
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);
        
        return success(res, {
            stats: stats[0] || {
                total_users: 0,
                total_profiles: 0,
                active_cases: 0,
                found_cases: 0,
                pending_sightings: 0,
                total_sightings: 0
            },
            recent_activity: recent,
            daily_stats: dailyStats
        }, 'Dashboard statistics retrieved successfully');
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return error(res, 'Failed to retrieve statistics', 500);
    }
};

// Get all users (admin)
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role = '', search = '' } = req.query;
        
        let query = `SELECT user_id, name, email, role, phone, address, is_active, created_at FROM users WHERE role != 'admin'`;
        const params = [];
        
        if (role) {
            query += ` AND role = ?`;
            params.push(role);
        }
        
        if (search) {
            query += ` AND (name LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        // Get total count
        const countQuery = query.replace('SELECT user_id, name, email, role, phone, address, is_active, created_at', 'SELECT COUNT(*) as total');
        const countResult = await db.getOne(countQuery, params);
        const total = countResult ? countResult.total : 0;
        
        // Get paginated data
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const users = await db.getMany(query, params);
        
        return success(res, {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, 'Users retrieved successfully');
    } catch (error) {
        console.error('Get users error:', error);
        return error(res, 'Failed to retrieve users', 500);
    }
};

// Get user by ID (admin)
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return notFound(res, 'User');
        }
        
        // Get user's stats
        const stats = await db.getOne(`
            SELECT 
                (SELECT COUNT(*) FROM elderly_profiles WHERE user_id = ? AND is_active = TRUE) as total_profiles,
                (SELECT COUNT(*) FROM missing_reports mr 
                 JOIN elderly_profiles ep ON mr.profile_id = ep.profile_id 
                 WHERE ep.user_id = ? AND mr.status IN ('active', 'urgent')) as active_cases,
                (SELECT COUNT(*) FROM missing_reports mr 
                 JOIN elderly_profiles ep ON mr.profile_id = ep.profile_id 
                 WHERE ep.user_id = ? AND mr.status = 'found') as found_cases
        `, [id, id, id]);
        
        return success(res, { user, stats }, 'User retrieved successfully');
    } catch (error) {
        console.error('Get user error:', error);
        return error(res, 'Failed to retrieve user', 500);
    }
};

// Update user (admin)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, role, is_active } = req.body;
        
        const user = await User.findById(id);
        if (!user) {
            return notFound(res, 'User');
        }
        
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        if (role) updates.role = role;
        if (is_active !== undefined) updates.is_active = is_active;
        
        const updated = await User.update(id, updates);
        if (!updated) {
            return error(res, 'No changes made', 400);
        }
        
        const updatedUser = await User.findById(id);
        return success(res, { user: updatedUser }, 'User updated successfully');
    } catch (error) {
        console.error('Update user error:', error);
        return error(res, 'Failed to update user', 500);
    }
};

// Delete user (admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.userId) {
            return error(res, 'Cannot delete your own account', 400);
        }
        
        const user = await User.findById(id);
        if (!user) {
            return notFound(res, 'User');
        }
        
        const deleted = await User.delete(id);
        if (!deleted) {
            return error(res, 'Failed to delete user', 400);
        }
        
        return success(res, null, 'User deleted successfully');
    } catch (error) {
        console.error('Delete user error:', error);
        return error(res, 'Failed to delete user', 500);
    }
};

// Get all reports (admin)
exports.getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '' } = req.query;
        const reports = await Report.getAll(parseInt(limit), (parseInt(page) - 1) * parseInt(limit), status);
        const total = await Report.countAll(status);
        
        return success(res, {
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, 'Reports retrieved successfully');
    } catch (error) {
        console.error('Get all reports error:', error);
        return error(res, 'Failed to retrieve reports', 500);
    }
};

// Get all sightings (admin)
exports.getAllSightings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '' } = req.query;
        const sightings = await Sighting.getAll(parseInt(limit), (parseInt(page) - 1) * parseInt(limit), status);
        const total = await Sighting.countAll(status);
        
        return success(res, {
            sightings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, 'Sightings retrieved successfully');
    } catch (error) {
        console.error('Get all sightings error:', error);
        return error(res, 'Failed to retrieve sightings', 500);
    }
};

// Get system logs (admin)
exports.getSystemLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const logs = await db.getMany(`
            SELECT 
                log_id,
                u.name as user_name,
                action,
                table_name,
                record_id,
                ip_address,
                created_at
            FROM audit_log al
            LEFT JOIN users u ON al.user_id = u.user_id
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);
        
        const countResult = await db.getOne('SELECT COUNT(*) as total FROM audit_log');
        const total = countResult ? countResult.total : 0;
        
        return success(res, {
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, 'System logs retrieved successfully');
    } catch (error) {
        console.error('Get system logs error:', error);
        return error(res, 'Failed to retrieve system logs', 500);
    }
};

// Get system health (admin)
exports.getSystemHealth = async (req, res) => {
    try {
        // Database status
        const dbStatus = await db.getOne('SELECT 1 as connected');
        
        // Database size
        const dbSize = await db.getOne(`
            SELECT 
                SUM(data_length + index_length) / 1024 / 1024 as size_mb
            FROM information_schema.tables
            WHERE table_schema = ?
        `, [process.env.DB_NAME]);
        
        // User count
        const userCount = await User.getCount();
        
        // Active reports
        const activeReports = await Report.countAllActive();
        
        return success(res, {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: !!dbStatus,
                size: dbSize ? Math.round(dbSize.size_mb * 100) / 100 : 0
            },
            statistics: {
                total_users: userCount,
                active_reports: activeReports
            }
        }, 'System health retrieved successfully');
    } catch (error) {
        console.error('Get system health error:', error);
        return error(res, 'Failed to retrieve system health', 500);
    }
};