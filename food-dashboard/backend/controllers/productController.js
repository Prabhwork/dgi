const Product = require('../models/Product');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// GET all products (Partitioned by Partner)
exports.getAllProducts = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available !== undefined) filter.available = req.query.available === 'true';
    const products = await Product.find(filter).sort({ id: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single product (enforcing partner isolation)
exports.getProductById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const product = await Product.findOne({ _id: req.params.id, partnerId });
    if (!product) return res.status(404).json({ message: 'Product not found or access denied' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST add new product (automatically assigning current partnerId)
exports.createProduct = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const lastProduct = await Product.findOne({ partnerId, id: { $exists: true, $ne: null } }).sort({ id: -1 });
    const newId = (lastProduct && typeof lastProduct.id === 'number') ? lastProduct.id + 1 : 1;
    const product = new Product({ ...req.body, id: newId, partnerId });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update product (enforcing partner isolation)
exports.updateProduct = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found or access denied' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT toggle availability (enforcing partner isolation)
exports.toggleProductAvailability = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const product = await Product.findOne({ _id: req.params.id, partnerId });
    if (!product) return res.status(404).json({ message: 'Product not found or access denied' });
    product.available = !product.available;
    const saved = await product.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE product (multi-tenant protection)
exports.deleteProduct = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Product.findOneAndDelete({ _id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Access denied or product not found' });
    res.json({ message: 'Product purged from partner records', product: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT toggle ban status (enforcing partner isolation)
exports.toggleProductBan = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const product = await Product.findOne({ _id: req.params.id, partnerId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.isBanned = !product.isBanned;
    if (product.isBanned) {
      product.banReason = req.body.reason || 'Banned by platform administrator';
    } else {
      product.banReason = '';
    }
    
    const saved = await product.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
