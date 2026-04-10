const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET all settlements (Partner side)
router.get('/', settlementController.getAllSettlements);

// POST request a payout (Partner side)
router.post('/request-payout', settlementController.requestPayout);

// GET wallet overview (balance, lifetime, etc.)
router.get('/meta/wallet', settlementController.getWalletOverview);

module.exports = router;
