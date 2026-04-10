const MainCategory = require('../models/MainCategory');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// @desc    Get search suggestions
// @route   GET /api/suggestions
// @access  Public
exports.getSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json({ success: true, data: [] });
        }

        const regex = new RegExp(q, 'i');

        // Search in Main Categories
        const mainCats = await MainCategory.find({ name: regex, isActive: { $ne: false } })
            .select('name')
            .limit(5);

        const mainCatResults = mainCats.map(c => ({
            text: c.name,
            type: 'Main Category'
        }));

        // Search in Categories
        const cats = await Category.find({ name: regex, isActive: { $ne: false } })
            .select('name')
            .limit(5);

        const catResults = cats.map(c => ({
            text: c.name,
            type: 'Category'
        }));

        // Search in Subcategories
        const subCats = await Subcategory.find({ name: regex, isActive: { $ne: false } })
            .select('name')
            .limit(5);

        const subCatResults = subCats.map(c => ({
            text: c.name,
            type: 'Subcategory'
        }));

        // Combine and dedup (roughly)
        const combined = [...mainCatResults, ...catResults, ...subCatResults];
        
        // Take top 8 unique
        const seen = new Set();
        const unique = [];
        for (const item of combined) {
            if (!seen.has(item.text.toLowerCase())) {
                seen.add(item.text.toLowerCase());
                unique.push(item);
            }
            if (unique.length >= 8) break;
        }

        res.status(200).json({
            success: true,
            data: unique
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
