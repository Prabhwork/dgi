const Category = require('../models/Category');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || req.partnerId;

// GET all categories (Partitioned by Partner)
exports.getAllCategories = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.all !== 'true') filter.active = true;
    const categories = await Category.find(filter).sort({ createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single category (enforcing partner isolation)
exports.getCategoryById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const category = await Category.findOne({ _id: req.params.id, partnerId });
    if (!category) return res.status(404).json({ message: 'Category not found or access denied' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create a new category (automatically assigning current partnerId)
exports.createCategory = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    // Check for duplicate WITHIN partner
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      partnerId 
    });
    if (existing) return res.status(409).json({ message: 'Category already exists in your menu' });
    
    const category = new Category({ ...req.body, partnerId });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update category (enforcing partner isolation)
exports.updateCategory = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found or access denied' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE category (multi-tenant protection)
exports.deleteCategory = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Category.findOneAndDelete({ _id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Access denied or category not found' });
    res.json({ message: 'Category purged from partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
