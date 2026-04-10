const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protectPartner } = require('../middleware/auth');

// GET all reviews (with optional sentiment filter) - Public
router.get('/', reviewController.getAllReviews);
router.post('/public', reviewController.createReview);

router.use(protectPartner);

// GET single review
router.get('/:id', reviewController.getReviewById);

// POST create a new review
router.post('/', reviewController.createReview);

// PUT reply to a review
router.put('/:id/reply', reviewController.replyToReview);

// PATCH toggle like on a review
router.patch('/:id/like', reviewController.toggleLike);

router.post('/:id/reward', reviewController.issueCouponToReviewer);
router.post('/:id/reward/reset', reviewController.resetReward);

// DELETE review
router.delete('/:id', reviewController.deleteReview);

// GET review summary stats (average rating, sentiment breakdown)
router.get('/meta/summary', reviewController.getReviewSummary);

module.exports = router;
