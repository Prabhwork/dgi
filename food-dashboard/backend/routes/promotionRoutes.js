const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protectPartner } = require('../middleware/auth');

// GET all coupons - Public
router.get('/', promotionController.getAllCoupons);

// POST validate coupon - Public
router.post('/validate', promotionController.validateCoupon);

router.use(protectPartner);

// GET single coupon
router.get('/:id', promotionController.getCouponById);

// POST create new coupon
router.post('/', promotionController.createCoupon);

// PUT update coupon (status, etc.)
router.put('/:id', promotionController.updateCoupon);

// DELETE coupon
router.delete('/:id', promotionController.deleteCoupon);

// GET promotions summary
router.get('/meta/summary', promotionController.getPromotionSummary);


module.exports = router;
