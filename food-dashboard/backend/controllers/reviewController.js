const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const fcmService = require('../services/fcmService');
const mongoose = require('mongoose');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// GET all reviews (Partitioned by Partner)
exports.getAllReviews = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.sentiment) filter.sentiment = req.query.sentiment;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single review (enforcing partner isolation)
exports.getReviewById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const review = await Review.findOne({ _id: req.params.id, partnerId });
    if (!review) return res.status(404).json({ message: 'Review not found or access denied' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create a new review (automatically assigning current partnerId)
exports.createReview = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { orderId } = req.body;

    // Check if review already exists for this order
    if (orderId) {
      const existing = await Review.findOne({ orderId });
      if (existing) {
        return res.status(400).json({ message: 'A review for this order already exists.' });
      }
    }

    const review = new Review({ ...req.body, partnerId });
    const saved = await review.save();

    // Trigger FCM Notification for New Review (to Partner)
    try {
        await fcmService.sendToTopic(`food-admin-${partnerId}`, {
            title: '⭐ New Review Received',
            body: `${saved.customer || 'A user'} gave you ${saved.rating} stars!`,
            data: { reviewId: saved._id.toString(), type: 'NEW_REVIEW' }
        });
    } catch (fcmErr) {
        console.error("FCM New Review Error:", fcmErr);
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT reply to a review (enforcing partner isolation)
exports.replyToReview = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { reply, repliedBy } = req.body;
    if (!reply) return res.status(400).json({ message: 'reply text is required' });
    
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { 
        reply, 
        replied: true, 
        repliedBy: repliedBy || 'Restaurant Partner',
        repliedAt: new Date()
      },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found or access denied' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH toggle like on a review (enforcing partner isolation)
exports.toggleLike = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const review = await Review.findOne({ _id: req.params.id, partnerId });
    if (!review) return res.status(404).json({ message: 'Review not found or access denied' });
    
    // True toggle logic: bit/boolean toggle
    review.isLikedByPartner = !review.isLikedByPartner;
    
    // Update the total count accordingly (0 or 1 for now)
    review.likes = review.isLikedByPartner ? 1 : 0;
    
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE review (multi-tenant protection)
exports.deleteReview = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Review.findOneAndDelete({ _id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Access denied or review not found' });
    res.json({ message: 'Review purged from partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET review summary stats (Partitioned by Partner)
exports.getReviewSummary = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const reviews = await Review.find({ partnerId });
    if (reviews.length === 0) return res.json({ avg: 0, total: 0, positive: 0, neutral: 0, negative: 0 });

    const avg = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
    const positive = reviews.filter(r => r.sentiment === 'Positive').length;
    const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;
    const negative = reviews.filter(r => r.sentiment === 'Negative').length;

    res.json({
      avg: Number(avg),
      total: reviews.length,
      positive,
      neutral,
      negative,
      positivePercent: Math.round((positive / reviews.length) * 100),
      neutralPercent: Math.round((neutral / reviews.length) * 100),
      negativePercent: Math.round((negative / reviews.length) * 100),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST issue a private reward coupon (Partitioned)
exports.issueCouponToReviewer = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { id } = req.params;
    const { discountValue, type } = req.body;
    
    // Enforcing partition
    const review = await Review.findOne({ _id: id, partnerId });
    if (!review) return res.status(404).json({ message: 'Review not found or access denied' });
    
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const customerName = review.customer || 'USER';
    const cleanName = customerName.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const code = `GIFT-${partnerId.split('-')[0].toUpperCase()}-${randomStr}`;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const coupon = new Coupon({
      code,
      partnerId,
      type: type || 'Percentage',
      value: discountValue || 15,
      minBillValue: req.body.minBillValue || 0,
      maxUses: 1,
      scope: 'Global',
      isPrivate: true,
      userId: customerName,
      expiry: expiryDate.toISOString().split('T')[0],
      description: `Reviewer Reward for ${customerName}`
    });

    await coupon.save();
    
    review.rewardSent = true;
    review.rewardCode = code;
    await review.save();
    
    res.status(201).json({ coupon, message: 'Reward coupon issued and linked to partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH reset a reward (Partitioned)
exports.resetReward = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const review = await Review.findOne({ _id: req.params.id, partnerId });
    if (!review) return res.status(404).json({ message: 'Review not found or access denied' });
    
    review.rewardSent = false;
    review.rewardCode = null;
    await review.save();
    
    res.json({ message: 'Reward reset successfully in partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
