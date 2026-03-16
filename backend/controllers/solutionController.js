const Solution = require('../models/Solution');
const Category = require('../models/Category');

// @desc    Get all solutions
// @route   GET /api/solutions
// @route   GET /api/categories/:categoryId/solutions
// @access  Public
exports.getSolutions = async (req, res) => {
    try {
        if (req.params.categoryId) {
            const solutions = await Solution.find({ category: req.params.categoryId });
            return res.status(200).json({ success: true, count: solutions.length, data: solutions });
        } else {
            res.status(200).json(res.advancedResults);
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single solution
// @route   GET /api/solutions/:id
// @access  Public
exports.getSolution = async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id).populate({
            path: 'category',
            select: 'name description'
        });

        if (!solution) {
            return res.status(404).json({ success: false, message: 'Solution not found' });
        }
        res.status(200).json({ success: true, data: solution });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add solution
// @route   POST /api/categories/:categoryId/solutions
// @access  Private
exports.createSolution = async (req, res) => {
    try {
        req.body.category = req.params.categoryId;

        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const solution = await Solution.create(req.body);
        res.status(201).json({ success: true, data: solution });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update solution
// @route   PUT /api/solutions/:id
// @access  Private
exports.updateSolution = async (req, res) => {
    try {
        let solution = await Solution.findById(req.params.id);
        if (!solution) {
            return res.status(404).json({ success: false, message: 'Solution not found' });
        }

        solution = await Solution.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: solution });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete solution
// @route   DELETE /api/solutions/:id
// @access  Private
exports.deleteSolution = async (req, res) => {
    try {
        const solution = await Solution.findById(req.params.id);
        if (!solution) {
            return res.status(404).json({ success: false, message: 'Solution not found' });
        }

        await solution.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
