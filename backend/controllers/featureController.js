const Feature = require('../models/Feature');
const Category = require('../models/Category');

// @desc    Get all features
// @route   GET /api/features
// @route   GET /api/categories/:categoryId/features
// @access  Public
exports.getFeatures = async (req, res) => {
    try {
        if (req.params.categoryId) {
            const features = await Feature.find({ category: req.params.categoryId });
            return res.status(200).json({ success: true, count: features.length, data: features });
        } else {
            res.status(200).json(res.advancedResults);
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single feature
// @route   GET /api/features/:id
// @access  Public
exports.getFeature = async (req, res) => {
    try {
        const feature = await Feature.findById(req.params.id).populate({
            path: 'category',
            select: 'name description'
        });

        if (!feature) {
            return res.status(404).json({ success: false, message: 'Feature not found' });
        }
        res.status(200).json({ success: true, data: feature });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add feature
// @route   POST /api/categories/:categoryId/features
// @access  Private
exports.createFeature = async (req, res) => {
    try {
        req.body.category = req.params.categoryId;

        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const feature = await Feature.create(req.body);
        res.status(201).json({ success: true, data: feature });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update feature
// @route   PUT /api/features/:id
// @access  Private
exports.updateFeature = async (req, res) => {
    try {
        let feature = await Feature.findById(req.params.id);
        if (!feature) {
            return res.status(404).json({ success: false, message: 'Feature not found' });
        }

        feature = await Feature.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: feature });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete feature
// @route   DELETE /api/features/:id
// @access  Private
exports.deleteFeature = async (req, res) => {
    try {
        const feature = await Feature.findById(req.params.id);
        if (!feature) {
            return res.status(404).json({ success: false, message: 'Feature not found' });
        }

        await feature.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
