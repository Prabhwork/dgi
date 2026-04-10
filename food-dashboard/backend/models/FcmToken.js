const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web'
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure unique tokens per partner
fcmTokenSchema.index({ partnerId: 1, token: 1 }, { unique: true });

module.exports = mongoose.model('FcmToken', fcmTokenSchema);
