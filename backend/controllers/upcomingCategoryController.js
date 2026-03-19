const UpcomingCategory = require('../models/UpcomingCategory');
const path = require('path');
const fs = require('fs');

// @desc    Get all upcoming categories
// @route   GET /api/upcoming-categories
// @access  Public
exports.getUpcomingCategories = async (req, res) => {
    try {
        const upcomingCategories = await UpcomingCategory.find()
            .populate('category', 'name')
            .sort('order');

        res.status(200).json({
            success: true,
            count: upcomingCategories.length,
            data: upcomingCategories
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single upcoming category
// @route   GET /api/upcoming-categories/:id
// @access  Public
exports.getUpcomingCategory = async (req, res) => {
    try {
        const upcomingCategory = await UpcomingCategory.findById(req.params.id)
            .populate('category', 'name');

        if (!upcomingCategory) {
            return res.status(404).json({ success: false, error: 'Upcoming category not found' });
        }

        res.status(200).json({
            success: true,
            data: upcomingCategory
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new upcoming category
// @route   POST /api/upcoming-categories
// @access  Private/Admin
exports.createUpcomingCategory = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.filename;
        }

        const upcomingCategory = await UpcomingCategory.create(req.body);
        res.status(201).json({ success: true, data: upcomingCategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update upcoming category
// @route   PUT /api/upcoming-categories/:id
// @access  Private/Admin
exports.updateUpcomingCategory = async (req, res) => {
    try {
        let upcomingCategory = await UpcomingCategory.findById(req.params.id);

        if (!upcomingCategory) {
            return res.status(404).json({ success: false, error: 'Upcoming category not found' });
        }

        if (req.file) {
            // Delete old image
            if (upcomingCategory.image && upcomingCategory.image !== 'no-photo.jpg') {
                const oldPath = path.join(__dirname, '../uploads/', upcomingCategory.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            req.body.image = req.file.filename;
        }

        upcomingCategory = await UpcomingCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: upcomingCategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete upcoming category
// @route   DELETE /api/upcoming-categories/:id
// @access  Private/Admin
exports.deleteUpcomingCategory = async (req, res) => {
    try {
        const upcomingCategory = await UpcomingCategory.findById(req.params.id);

        if (!upcomingCategory) {
            return res.status(404).json({ success: false, error: 'Upcoming category not found' });
        }

        // Delete image
        if (upcomingCategory.image && upcomingCategory.image !== 'no-photo.jpg') {
            const imagePath = path.join(__dirname, '../uploads/', upcomingCategory.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await upcomingCategory.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
