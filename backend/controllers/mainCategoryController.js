const MainCategory = require('../models/MainCategory');

// @desc    Get all main categories
// @route   GET /api/main-categories
// @access  Private
exports.getMainCategories = async (req, res, next) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single main category
// @route   GET /api/main-categories/:id
// @access  Private
exports.getMainCategory = async (req, res, next) => {
    try {
        const mainCategory = await MainCategory.findById(req.params.id);

        if (!mainCategory) {
            return res.status(404).json({ success: false, error: 'Main category not found' });
        }
        res.status(200).json({ success: true, data: mainCategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new main category
// @route   POST /api/main-categories
// @access  Private
exports.createMainCategory = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path.replace(/\\/g, '/');
        }
        const mainCategory = await MainCategory.create(req.body);
        res.status(201).json({ success: true, data: mainCategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update main category
// @route   PUT /api/main-categories/:id
// @access  Private
exports.updateMainCategory = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.image = req.file.path.replace(/\\/g, '/');
        }

        const mainCategory = await MainCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!mainCategory) {
            return res.status(404).json({ success: false, error: 'Main category not found' });
        }

        res.status(200).json({ success: true, data: mainCategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete main category
// @route   DELETE /api/main-categories/:id
// @access  Private
exports.deleteMainCategory = async (req, res, next) => {
    try {
        const mainCategory = await MainCategory.findByIdAndDelete(req.params.id);

        if (!mainCategory) {
            return res.status(404).json({ success: false, error: 'Main category not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
