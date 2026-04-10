const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Order', 'System', 'Audit', 'Security', 'User'],
    default: 'System'
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ adminId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
