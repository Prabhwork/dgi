const mongoose = require('mongoose');
const mainDb    = require('../config/mainDb');

// ── DBI Base URL for serving uploaded images ───────────────────────────────────
const DBI_BASE_URL = process.env.DBI_API_URL;

// ── DBI businessHours → Food Dashboard format converter ───────────────────────
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
function convertDbiHours(dbiHours) {
  const result = {};
  if (!dbiHours) return result;
  DAYS.forEach(day => {
    const cap = day.charAt(0).toUpperCase() + day.slice(1);
    const d   = dbiHours[day];
    result[cap] = (!d || !d.isOpen || !d.slots?.length)
      ? []
      : d.slots.map(s => ({ from: s.open || '', to: s.close || '' }));
  });
  return result;
}

// ── Settings Model ────────────────────────────────────────────────────────────
const Settings = require('../models/Settings');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// ─────────────────────────────────────────────────────────────────────────────
//  SETTINGS CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// ── Sync DBI business data into food-dashboard settings ───────────────────────
async function syncFromDBI(settings, partnerId) {
  try {
    const ObjectId = require('mongoose').Types.ObjectId;
    const dbi = await mainDb.collection('businesses').findOne(
      { _id: new ObjectId(partnerId) },
      { projection: { password: 0, aadhaarNumber: 0 } }
    );
    if (!dbi) return settings;

    let changed = false;

    // Business name
    const dbiName = dbi.businessName || dbi.brandName;
    if (dbiName && (settings.businessName === 'Restaurant Partner' || settings.businessName === 'DGI Partner')) {
      settings.businessName = dbiName; changed = true;
    }

    // Contact
    const dbiContact = dbi.primaryContactNumber || dbi.secondaryContactNumber;
    if (dbiContact && (!settings.contact || settings.contact === '+91 98765 43210')) {
      settings.contact = dbiContact; changed = true;
    }

    // Address
    const dbiAddress = dbi.fullAddress || dbi.registeredOfficeAddress;
    if (dbiAddress && (!settings.address || settings.address === 'Store Address')) {
      settings.address = dbiAddress; changed = true;
    }

    // Cover Photo URL
    if (dbi.coverImage && !settings.coverPhotoUrl) {
      const img = dbi.coverImage;
      settings.coverPhotoUrl = img.startsWith('http') ? img : `${DBI_BASE_URL}/${img.replace(/^\//, '')}`;
      changed = true;
    }

    // Business Hours (Sync from DBI Profile)
    if (dbi.businessHours) {
      const syncedHours = convertDbiHours(dbi.businessHours);
      // Continuous Sync: Update if local settings differ from DBI profile data
      if (JSON.stringify(syncedHours) !== JSON.stringify(settings.businessHours)) {
        settings.businessHours = syncedHours;
        settings.markModified('businessHours');
        changed = true;
      }
    }

    if (changed) await settings.save();
    return settings;
  } catch (e) {
    console.error('[Settings] DBI sync error:', e.message);
    return settings;
  }
}

// GET settings (Partitioned by Partner)
exports.getSettings = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const Partner   = require('../models/Partner');
    const partner   = await Partner.findOne({ id: partnerId });

    let settings = await Settings.findOne({ partnerId });
    if (!settings) {
      settings = await Settings.create({
        partnerId,
        businessName: partner?.businessName || 'Restaurant Partner'
      });
    }

    // Sync live data from DBI main database
    settings = await syncFromDBI(settings, partnerId);

    // Check if there is an active FSSAI submission pending review
    const FSSAISubmission = require('../models/FSSAISubmission');
    const fssaiEntry = await FSSAISubmission.findOne({ partnerId });
    
    // Self-Healing: If approved but missing in settings, update it now
    if (!settings.fssai && fssaiEntry?.status === 'Approved' && fssaiEntry.fssaiNumber) {
        settings.fssai = fssaiEntry.fssaiNumber;
        await settings.save();
    }

    // Convert Mongoose document to plain object to inject custom property
    const responseData = settings.toObject ? settings.toObject() : settings;
    responseData.fssaiSubmissionPending = fssaiEntry?.status === 'Pending';

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update settings (Partner Isolated)
exports.updateSettings = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) {
      settings = new Settings({ ...req.body, partnerId });
    } else {
      const { notifications, businessHours, ...rest } = req.body;
      Object.assign(settings, rest);
      if (notifications) {
        settings.notifications = { ...settings.notifications.toObject?.() || settings.notifications, ...notifications };
      }
      if (businessHours) {
        settings.businessHours = businessHours;
        settings.markModified('businessHours');
      }
    }
    const saved = await settings.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Toggle live status (Partitioned)
exports.toggleLiveStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    settings.isLive = !settings.isLive;
    const saved = await settings.save();
    res.json({
      isLive: saved.isLive,
      message: saved.isLive ? 'Shop is now LIVE on the map' : 'Shop is now HIDDEN from the map'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle auto-accept (Partitioned)
exports.toggleAutoAccept = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    settings.autoAcceptOrders = !settings.autoAcceptOrders;
    const saved = await settings.save();
    res.json({ autoAcceptOrders: saved.autoAcceptOrders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle KOT (Partitioned)
exports.toggleKOT = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    settings.autoPrintKOT = !settings.autoPrintKOT;
    const saved = await settings.save();
    res.json({ autoPrintKOT: saved.autoPrintKOT });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update notifications (Partitioned)
exports.updateNotifications = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    const current = settings.notifications.toObject?.() || settings.notifications || {};
    settings.notifications = { ...current, ...req.body };
    const saved = await settings.save();
    res.json(saved.notifications);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update Business Hours (Partitioned)
exports.updateBusinessHours = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    settings.businessHours = req.body.businessHours || req.body;
    settings.markModified('businessHours');
    const saved = await settings.save();
    res.json({ businessHours: saved.businessHours });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update day hours (Partitioned)
exports.updateDayHours = async (req, res) => {
  try {
    const validDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const day = req.params.day;
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: `Invalid day. Must be one of: ${validDays.join(', ')}` });
    }
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    const current = settings.businessHours || {};
    settings.businessHours = { ...current, [day]: req.body.shifts || req.body };
    settings.markModified('businessHours');
    const saved = await settings.save();
    res.json({ day, shifts: saved.businessHours[day] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update compliance details (Partitioned)
exports.updateCompliance = async (req, res) => {
  try {
    const { gstin, fssai } = req.body;
    const partnerId = getPartnerId(req);
    let settings = await Settings.findOne({ partnerId });
    if (!settings) settings = await Settings.create({ partnerId });
    if (gstin !== undefined) settings.gstin = gstin;
    if (fssai !== undefined) settings.fssai = fssai;
    const saved = await settings.save();
    res.json({ gstin: saved.gstin, fssai: saved.fssai });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
