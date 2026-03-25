const GoogleCategory = require('../models/GoogleCategory');

// @desc    Get all google categories
// @route   GET /api/google-categories
// @access  Public
exports.getGoogleCategories = async (req, res) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single google category
// @route   GET /api/google-categories/:id
// @access  Public
exports.getGoogleCategory = async (req, res) => {
    try {
        const category = await GoogleCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new google category
// @route   POST /api/google-categories
// @access  Private (Admin)
exports.createGoogleCategory = async (req, res) => {
    try {
        const category = await GoogleCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update google category
// @route   PUT /api/google-categories/:id
// @access  Private (Admin)
exports.updateGoogleCategory = async (req, res) => {
    try {
        const category = await GoogleCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete google category
// @route   DELETE /api/google-categories/:id
// @access  Private (Admin)
exports.deleteGoogleCategory = async (req, res) => {
    try {
        const category = await GoogleCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
