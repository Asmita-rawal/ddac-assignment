const Sighting = require('../models/Sighting');
const Report = require('../models/Report');

// Submit sighting
exports.submitSighting = async (req, res) => {
    try {
        const { report_id, description, location } = req.body;

        // Check if report exists
        const report = await Report.findById(report_id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const sightingData = {
            report_id,
            user_id: req.user.id,
            description,
            location,
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null,
            sighting_time: req.body.sighting_time || new Date(),
            image_url: req.file ? req.file.path : null
        };

        const sightingId = await Sighting.create(sightingData);

        // Update report status if needed
        if (report.status === 'active') {
            await Report.updateStatus(report_id, 'investigating');
        }

        res.status(201).json({
            success: true,
            message: 'Sighting submitted successfully',
            data: { id: sightingId }
        });

    } catch (error) {
        console.error('Submit sighting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit sighting'
        });
    }
};

// Get sightings for a report
exports.getSightingsByReport = async (req, res) => {
    try {
        const sightings = await Sighting.findByReport(req.params.reportId);
        res.json({
            success: true,
            data: sightings
        });
    } catch (error) {
        console.error('Get sightings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sightings'
        });
    }
};