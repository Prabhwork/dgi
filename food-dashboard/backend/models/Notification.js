const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  partnerId: { 
    type: String, 
    required: true, 
    index: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    enum: ['Order', 'Staff', 'Payment', 'System', 'Reservation'], 
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
  },
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
