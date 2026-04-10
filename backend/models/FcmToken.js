const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
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

// Ensure unique tokens per entity
fcmTokenSchema.index({ userId: 1, token: 1 }, { unique: true, sparse: true });
fcmTokenSchema.index({ adminId: 1, token: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('FcmToken', fcmTokenSchema);
