const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  partnerId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Neutral' },
  date: { type: String },
  orderId: { type: String },
  replied: { type: Boolean, default: false },
  reply: { type: String },
  repliedBy: { type: String },
  repliedAt: { type: Date },
  likes: { type: Number, default: 0 },
  isLikedByPartner: { type: Boolean, default: false },
  rewardSent: { type: Boolean, default: false },
  rewardCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
