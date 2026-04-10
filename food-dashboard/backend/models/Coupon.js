const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  partnerId: { type: String, required: true, index: true },
  type: { type: String, enum: ['Percentage', 'Flat Off', 'BOGO'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // number or '1+1'
  minBillValue: { type: Number, default: 0 },
  scope: { type: String, enum: ['Global', 'Category', 'Product'], default: 'Global' },
  targetId: { type: String }, // Store Category or Product ID
  targetName: { type: String }, // For Display (e.g. "Only on Chicken Items")
  isPrivate: { type: Boolean, default: false },
  userId: { type: String }, // Specific to a user (from Review)
  status: { type: String, enum: ['Active', 'Scheduled', 'Expired', 'Paused'], default: 'Active' },
  maxUses: { type: Number, default: 0 }, // 0 for unlimited
  usage: { type: Number, default: 0 },
  expiry: { type: String, required: true },
  description: { type: String },
  savingsGenerated: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
