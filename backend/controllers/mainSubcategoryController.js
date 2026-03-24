const MainSubcategory = require('../models/MainSubcategory');
const MainCategory = require('../models/MainCategory');

// @desc    Get all main subcategories
// @route   GET /api/main-subcategories
// @route   GET /api/main-categories/:mainCategoryId/main-subcategories
// @access  Public
exports.getMainSubcategories = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = req.params.mainCategoryId ? { mainCategory: req.params.mainCategoryId } : {};
        
        // Lookup mainCategory ID by name if provided
        if (req.query.mainCategoryName) {
            const mCat = await MainCategory.findOne({ name: { $regex: new RegExp('^' + req.query.mainCategoryName + '$', 'i') } });
            if (mCat) {
                filter.mainCategory = mCat._id;
            } else {
                // If category not found by name, return empty
                return res.status(200).json({ success: true, count: 0, total: 0, data: [] });
            }
        }

        // Add search filter if name is provided in query
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: 'i' };
        }

        const total = await MainSubcategory.countDocuments(filter);
        const items = await MainSubcategory.find(filter)
            .populate({ path: 'mainCategory', select: 'name' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ 
            success: true, 
            count: items.length, 
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            data: items 
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new main subcategory
// @route   POST /api/main-categories/:mainCategoryId/main-subcategories
// @access  Private
exports.createMainSubcategory = async (req, res, next) => {
    try {
        req.body.mainCategory = req.params.mainCategoryId;

        const mainCategory = await MainCategory.findById(req.params.mainCategoryId);
        if (!mainCategory) {
            return res.status(404).json({ success: false, error: 'Main Category not found' });
        }

        const item = await MainSubcategory.create(req.body);
        const populated = await item.populate({ path: 'mainCategory', select: 'name' });
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update main subcategory
// @route   PUT /api/main-subcategories/:id
// @access  Private
exports.updateMainSubcategory = async (req, res, next) => {
    try {
        const item = await MainSubcategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({ path: 'mainCategory', select: 'name' });

        if (!item) {
            return res.status(404).json({ success: false, error: 'Main Subcategory not found' });
        }

        res.status(200).json({ success: true, data: item });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete main subcategory
// @route   DELETE /api/main-subcategories/:id
// @access  Private
exports.deleteMainSubcategory = async (req, res, next) => {
    try {
        const item = await MainSubcategory.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Main Subcategory not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
