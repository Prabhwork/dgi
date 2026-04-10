const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || req.partnerId;

// GET all coupons (Partitioned by Partner)
exports.getAllCoupons = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.status) filter.status = req.query.status;
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single coupon (enforcing partner isolation)
exports.getCouponById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const coupon = await Coupon.findOne({ _id: req.params.id, partnerId });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found or access denied' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create new coupon (automatically assigning current partnerId)
exports.createCoupon = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const existing = await Coupon.findOne({ code: req.body.code?.toUpperCase(), partnerId });
    if (existing) return res.status(409).json({ message: 'Coupon code already exists in your records' });
    
    const coupon = new Coupon({ ...req.body, code: req.body.code?.toUpperCase(), partnerId });
    const saved = await coupon.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update coupon (enforcing partner isolation)
exports.updateCoupon = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ message: 'Coupon not found or access denied' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE coupon (multi-tenant protection)
exports.deleteCoupon = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Coupon.findOneAndDelete({ _id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Access denied or coupon not found' });
    res.json({ message: 'Coupon purged from partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET promotions summary (Partitioned by Partner)
exports.getPromotionSummary = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const activeCoupons = await Coupon.countDocuments({ partnerId, status: 'Active' });
    const totalUsage = await Coupon.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, totalUsage: { $sum: '$usage' }, totalSavings: { $sum: '$savingsGenerated' } } }
    ]);
    res.json({
      activeCoupons,
      totalUsage: totalUsage[0]?.totalUsage || 0,
      totalSavings: totalUsage[0]?.totalSavings || 0,
      conversionRate: '+18.5%',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST validate coupon code (Partitioned with Fallback)
exports.validateCoupon = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { code, amount, categoryId, productId } = req.body;
    
    // Enforcing partition during validation
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), partnerId, status: 'Active' });

    if (!coupon) return res.status(404).json({ valid: false, message: 'Invalid or Expired Coupon' });

    // Check expiry
    const now = new Date().toISOString().split('T')[0];
    if (coupon.expiry < now) {
      coupon.status = 'Expired';
      await coupon.save();
      return res.status(400).json({ valid: false, message: 'Coupon has Expired' });
    }

    // Check usage limits
    if (coupon.maxUses > 0 && coupon.usage >= coupon.maxUses) {
      return res.status(400).json({ valid: false, message: 'Coupon Usage Limit Reached (Single Use Only)' });
    }

    // Check min bill
    if (amount < coupon.minBillValue) {
      return res.status(400).json({ valid: false, message: `Minimum order of ₹${coupon.minBillValue} required` });
    }

    // Check scoping (Category/Product)
    if (coupon.scope === 'Category' && categoryId !== coupon.targetId) {
      return res.status(400).json({ valid: false, message: `Only valid for ${coupon.targetName}` });
    }
    if (coupon.scope === 'Product' && productId !== coupon.targetId) {
      return res.status(400).json({ valid: false, message: `Only valid for ${coupon.targetName}` });
    }

    res.json({ valid: true, coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
