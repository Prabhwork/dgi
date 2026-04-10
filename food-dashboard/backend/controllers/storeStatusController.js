const mongoose = require('mongoose');
const fcmService = require('../services/fcmService');

// ── StoreStatus Schema ────────────────────────────────────────────────────────
const storeStatusSchema = new mongoose.Schema({
  partnerId: { type: String, required: true, unique: true, index: true },
  isOpen: { type: Boolean, default: true  },
  isBusy: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
});

const StoreStatus = mongoose.models.StoreStatus || mongoose.model('StoreStatus', storeStatusSchema);

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// ─────────────────────────────────────────────────────────────────────────────
//  STORE STATUS CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// GET current status (Partitioned by Partner)
exports.getStoreStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let status = await StoreStatus.findOne({ partnerId });
    if (!status) status = await StoreStatus.create({ partnerId });
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update status details (Partitioned by Partner)
exports.updateStoreStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let status = await StoreStatus.findOne({ partnerId });
    if (!status) status = new StoreStatus({ partnerId });
    Object.assign(status, req.body);
    status.lastUpdated = new Date();
    const saved = await status.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Toggle Open/Close (Partitioned)
exports.toggleOpen = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let status = await StoreStatus.findOne({ partnerId });
    if (!status) status = await StoreStatus.create({ partnerId });
    status.isOpen = !status.isOpen;
    status.lastUpdated = new Date();
    const saved = await status.save();

    // Trigger FCM Notification
    try {
        await fcmService.sendToTopic(`food-admin-${partnerId}`, {
            title: `Store ${saved.isOpen ? 'Opened' : 'Closed'}`,
            body: `Store is now ${saved.isOpen ? 'online and accepting orders' : 'offline'}.`,
            partnerId: partnerId,
            type: 'System',
            data: { isOpen: saved.isOpen.toString(), type: 'STORE_STATUS' }
        });
    } catch (fcmErr) {
        console.error("FCM Store Toggle Error:", fcmErr);
    }

    res.json({ isOpen: saved.isOpen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle Busy Mode (Partitioned)
exports.toggleBusy = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let status = await StoreStatus.findOne({ partnerId });
    if (!status) status = await StoreStatus.create({ partnerId });
    status.isBusy = !status.isBusy;
    status.lastUpdated = new Date();
    const saved = await status.save();

    // Trigger FCM Notification
    try {
        await fcmService.sendToTopic(`food-admin-${partnerId}`, {
            title: `Busy Mode ${saved.isBusy ? 'Activated' : 'Deactivated'}`,
            body: `Store is now in ${saved.isBusy ? 'Busy Mode (Slow Prep)' : 'Standard Mode'}.`,
            partnerId: partnerId,
            type: 'System',
            data: { isBusy: saved.isBusy.toString(), type: 'BUSY_STATUS' }
        });
    } catch (fcmErr) {
        console.error("FCM Busy Toggle Error:", fcmErr);
    }

    res.json({ isBusy: saved.isBusy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle Alerts Mute (Partitioned)
exports.toggleMute = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let status = await StoreStatus.findOne({ partnerId });
    if (!status) status = await StoreStatus.create({ partnerId });
    status.isMuted = !status.isMuted;
    status.lastUpdated = new Date();
    const saved = await status.save();
    res.json({ isMuted: saved.isMuted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
