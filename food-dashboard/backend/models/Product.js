const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  partnerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  description: { type: String },
  ingredients: { type: String },
  detailedDescription: { type: String },
  isVeg: { type: Boolean, default: true },
  prepTime: { type: Number, default: 15 },
  available: { type: Boolean, default: true },
  images: [{ type: String }],
  coverImage: { type: String },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
