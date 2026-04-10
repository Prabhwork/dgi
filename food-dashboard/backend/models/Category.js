const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  partnerId: { type: String, required: true, index: true },
  icon: { type: String, default: '🍽️' },
  color: { type: String, default: '#dc2626' },
  active: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String }
}, { timestamps: true });

// Category name must be unique WITHIN a partner/restaurant
categorySchema.index({ name: 1, partnerId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
