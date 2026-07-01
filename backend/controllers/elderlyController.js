const Elderly = require('../models/Elderly');

// Add elderly person
exports.addElderly = async (req, res) => {
    try {
        const elderlyData = {
            user_id: req.user.id,
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender,
            address: req.body.address,
            contact_person: req.body.contact_person,
            contact_phone: req.body.contact_phone,
            medical_conditions: req.body.medical_conditions,
            special_instructions: req.body.special_instructions,
            profile_image: req.file ? req.file.path : null
        };

        const elderlyId = await Elderly.create(elderlyData);

        res.status(201).json({
            success: true,
            message: 'Elderly person added successfully',
            data: { id: elderlyId }
        });

    } catch (error) {
        console.error('Add elderly error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add elderly person'
        });
    }
};

// Get all elderly
exports.getAllElderly = async (req, res) => {
    try {
        const elderly = await Elderly.findAll();
        res.json({
            success: true,
            data: elderly
        });
    } catch (error) {
        console.error('Get elderly error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch elderly'
        });
    }
};

// Get elderly by ID
exports.getElderlyById = async (req, res) => {
    try {
        const elderly = await Elderly.findById(req.params.id);
        if (!elderly) {
            return res.status(404).json({
                success: false,
                message: 'Elderly person not found'
            });
        }
        res.json({
            success: true,
            data: elderly
        });
    } catch (error) {
        console.error('Get elderly error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch elderly'
        });
    }
};

// Update elderly
exports.updateElderly = async (req, res) => {
    try {
        const updated = await Elderly.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Elderly person not found'
            });
        }
        res.json({
            success: true,
            message: 'Elderly updated successfully'
        });
    } catch (error) {
        console.error('Update elderly error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update elderly'
        });
    }
};

// Delete elderly
exports.deleteElderly = async (req, res) => {
    try {
        const deleted = await Elderly.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Elderly person not found'
            });
        }
        res.json({
            success: true,
            message: 'Elderly deleted successfully'
        });
    } catch (error) {
        console.error('Delete elderly error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete elderly'
        });
    }
};