const Report = require('../models/Report');
const Elderly = require('../models/Elderly');

// Create report
exports.createReport = async (req, res) => {
    try {
        const { elderly_id, report_type, description, location, priority } = req.body;

        // Check if elderly exists
        const elderly = await Elderly.findById(elderly_id);
        if (!elderly) {
            return res.status(404).json({
                success: false,
                message: 'Elderly person not found'
            });
        }

        const reportData = {
            elderly_id,
            reporter_id: req.user.id,
            report_type,
            description,
            location,
            priority: priority || 'medium',
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null
        };

        const reportId = await Report.create(reportData);

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            data: { id: reportId }
        });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create report'
        });
    }
};

// Get all reports
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.findAll();
        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
};

// Get report statistics
exports.getReportStats = async (req, res) => {
    try {
        const stats = await Report.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};