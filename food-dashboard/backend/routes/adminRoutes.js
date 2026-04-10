const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protectAdmin } = require('../middleware/auth');
const Admin = require('../models/Admin');
const BankDetail = require('../models/BankDetail');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Partner = require('../models/Partner');
const Settlement = require('../models/Settlement');
const Settings = require('../models/Settings');
const settlementController = require('../controllers/settlementController');
const fcmService = require('../services/fcmService');

// Helper to extract partnerId for Admin (No fallback for global view)
const getAdminPartnerId = (req) => req.headers['x-partner-id'] || req.query.partnerId;

// @desc    Managed Reset (Remote from Main Admin)
// @route   PUT /api/admin/managed-reset
// @access  Private (Secret Key)
router.put('/managed-reset', async (req, res) => {
    try {
        const secret = req.headers['x-management-secret'];
        if (!secret || secret !== (process.env.MANAGEMENT_SECRET || 'dbi_master_key_7721')) {
            return res.status(403).json({ success: false, message: 'Invalid management secret' });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find the main admin (assuming only one for now, or finding by email)
        let admin = await Admin.findOne();
        if (!admin) {
            admin = new Admin({ email, password });
        } else {
            admin.email = email;
            admin.password = password;
        }

        await admin.save();
        res.status(200).json({ success: true, message: 'Admin credentials updated via management link' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @desc    Login Admin
// @route   POST /api/admin/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin || !(await admin.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = admin.getSignedJwtToken();
        res.status(200).json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET all bank approvals (Managed - optional partner filter)
router.get('/bank-approvals', protectAdmin, async (req, res) => {
  try {
    const partnerId = getAdminPartnerId(req);
    const filter = { status: 'Pending' };
    if (partnerId) filter.partnerId = partnerId;
    const approvals = await BankDetail.find(filter).sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE bank approval status (Approve/Reject)
router.patch('/bank-approvals/:id', protectAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updated = await BankDetail.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason },
      { new: true }
    );

    // Trigger FCM Notification for Bank Status (to Partner)
    try {
        await fcmService.sendToTopic(`food-admin-${updated.partnerId}`, {
            title: status === 'Approved' ? '✅ Bank Verified' : '❌ Bank Verification Failed',
            body: status === 'Approved' ? 'Your bank account has been verified. You can now request payouts.' : `Verification failed: ${rejectionReason}`,
            data: { status, type: 'BANK_STATUS' }
        });
    } catch (fcmErr) {
        console.error("FCM Bank Update Error:", fcmErr);
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all settlement requests
router.get('/settlements', protectAdmin, settlementController.adminGetPendingSettlements);

// UPDATE settlement status (Approve/Reject)
router.patch('/settlements/:id', protectAdmin, async (req, res) => {
  try {
    const { status, utrNumber, adminNote } = req.body;
    const updateData = { status, adminNote };
    if (utrNumber) updateData.utrNumber = utrNumber;
    if (status === 'Completed') updateData.processedAt = new Date();

    const updated = await Settlement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Trigger FCM Notification for Payout Status (to Partner)
    try {
        await fcmService.sendToTopic(`food-admin-${updated.partnerId}`, {
            title: status === 'Completed' ? '💰 Payment Credited!' : '🏦 Payout Processing',
            body: status === 'Completed' ? `Amount ₹${updated.amount} has been processed. Trans ID: ${utrNumber || 'N/A'}` : `Your payout of ₹${updated.amount} is ${status.toLowerCase()}`,
            data: { settlementId: updated.id, status, type: 'PAYOUT_STATUS' }
        });
    } catch (fcmErr) {
        console.error("FCM Payout Update Error:", fcmErr);
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all products for moderation (Managed - optional partner filter)
router.get('/products', protectAdmin, async (req, res) => {
  try {
    const partnerId = getAdminPartnerId(req);
    const filter = {};
    if (partnerId) filter.partnerId = partnerId;
    const products = await Product.find(filter).sort({ partnerId: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BAN a product
router.patch('/products/:id/ban', protectAdmin, async (req, res) => {
  try {
    const { banReason } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason },
      { new: true }
    );

    // Trigger FCM Notification for Product Ban (to Partner)
    try {
        await fcmService.sendToTopic(`food-admin-${updated.partnerId}`, {
            title: '🚫 Product Restricted',
            body: `Your product "${updated.name}" has been banned for: ${banReason}`,
            data: { productId: updated._id, type: 'PRODUCT_BAN' }
        });
    } catch (fcmErr) {
        console.error("FCM Product Ban Error:", fcmErr);
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UNBAN a product
router.patch('/products/:id/unban', protectAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: '' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all categories for moderation (Managed - optional partner filter)
router.get('/categories', protectAdmin, async (req, res) => {
  try {
    const partnerId = getAdminPartnerId(req);
    const filter = {};
    if (partnerId) filter.partnerId = partnerId;
    const categories = await Category.find(filter).sort({ partnerId: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BAN a category
router.patch('/categories/:id/ban', protectAdmin, async (req, res) => {
  try {
    const { banReason } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all partners (Managed - optional search filter)
router.get('/partners', protectAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { businessName: { $regex: req.query.search, $options: 'i' } },
        { id: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const partners = await Partner.find(filter);
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET reviews moderation (New - optional partner filter)
const Review = require('../models/Review');
router.get('/reviews', protectAdmin, async (req, res) => {
  try {
    const partnerId = getAdminPartnerId(req);
    const filter = {};
    if (partnerId) filter.partnerId = partnerId;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE partner status (Suspend/Activate)
router.patch('/partners/:id/status', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Partner.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── FSSAI Compliance Submissions ───────────────────────────────────────────────
const FSSAISubmission = require('../models/FSSAISubmission');
const mongoose = require('mongoose');
const { protectPartner } = require('../middleware/auth');

// POST: Partner submits their FSSAI details + certificate
router.post('/fssai-submission', protectPartner, async (req, res) => {
  try {
    const partnerId = req.partnerId;
    const { fssaiNumber, fssaiImageUrl, businessName } = req.body;

    if (!fssaiNumber) {
      return res.status(400).json({ message: 'FSSAI number is required' });
    }

    // Create or update existing submission
    const existing = await FSSAISubmission.findOne({ partnerId });
    if (existing) {
      existing.fssaiNumber   = fssaiNumber;
      existing.fssaiImageUrl = fssaiImageUrl || existing.fssaiImageUrl;
      existing.businessName  = businessName || existing.businessName;
      existing.status        = 'Pending';
      existing.adminNote     = '';
      await existing.save();
      return res.json({ success: true, submission: existing });
    }

    const submission = await FSSAISubmission.create({ partnerId, fssaiNumber, fssaiImageUrl, businessName });
    res.status(201).json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Admin lists all FSSAI submissions
router.get('/fssai-submissions', protectAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const submissions = await FSSAISubmission.find(filter).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH: Admin approves or rejects a FSSAI submission
router.patch('/fssai-submissions/:id', protectAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const sub = await FSSAISubmission.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, reviewedAt: new Date() },
      { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'Submission not found' });

    // If approved, write fssai into the partner's Settings record
    if (status === 'Approved') {
      await Settings.findOneAndUpdate(
        { partnerId: sub.partnerId },
        { fssai: sub.fssaiNumber },
        { new: true, upsert: true }
      );
    }

    res.json({ success: true, submission: sub });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
