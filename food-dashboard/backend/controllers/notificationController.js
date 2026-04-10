const mongoose = require('mongoose');

// ── Notification Schema ────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  partnerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Order', 'Staff', 'Payment', 'System'], default: 'System' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// GET all notifications (Partitioned by Partner)
exports.getAllNotifications = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const notifications = await Notification.find({ partnerId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create notification (Partner Isolated)
exports.createNotification = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const notification = new Notification({ ...req.body, partnerId });
    const saved = await notification.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH mark as read (Partner Protected)
exports.markRead = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found or access denied' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH mark all as read (Partner Isolated)
exports.markAllRead = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    await Notification.updateMany({ partnerId, read: false }, { read: true });
    res.json({ message: 'All partner notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE notification (Partner Protected)
exports.deleteNotification = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Notification.findOneAndDelete({ _id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Notification not found or access denied' });
    res.json({ message: 'Notification purged from partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST register FCM token
exports.registerToken = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { token, deviceType } = req.body;
    
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const FcmToken = require('../models/FcmToken');
    
    // Update or create token entry
    await FcmToken.findOneAndUpdate(
      { partnerId, token },
      { partnerId, token, deviceType, lastUsed: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'FCM Token registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
