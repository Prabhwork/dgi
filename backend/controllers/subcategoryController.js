const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @route   GET /api/categories/:categoryId/subcategories
// @access  Private
exports.getSubcategories = async (req, res, next) => {
    try {
        if (req.params.categoryId) {
            const subcategories = await Subcategory.find({ category: req.params.categoryId });
            return res.status(200).json({ success: true, count: subcategories.length, data: subcategories });
        } else {
            res.status(200).json(res.advancedResults);
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Private
exports.getSubcategory = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate({
            path: 'category',
            select: 'name description'
        });

        if (!subcategory) {
            return res.status(404).json({ success: false, error: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, data: subcategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new subcategory
// @route   POST /api/categories/:categoryId/subcategories
// @access  Private
exports.createSubcategory = async (req, res, next) => {
    try {
        req.body.category = req.params.categoryId;

        const category = await Category.findById(req.params.categoryId);

        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const subcategory = await Subcategory.create(req.body);
        res.status(201).json({ success: true, data: subcategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private
exports.updateSubcategory = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!subcategory) {
            return res.status(404).json({ success: false, error: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, data: subcategory });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private
exports.deleteSubcategory = async (req, res, next) => {
    try {
        const subcategory = await Subcategory.findByIdAndDelete(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ success: false, error: 'Subcategory not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
