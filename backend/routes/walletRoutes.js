const express = require('express');
const router = express.Router();
const { 
    getWalletBalance, 
    createRechargeOrder, 
    verifyRecharge, 
    setWalletPin, 
    verifyPin,
    getTransactions,
    processPayment,
    forgotPin,
    resetPin
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/balance', getWalletBalance);
router.get('/transactions', getTransactions);
router.post('/recharge/order', createRechargeOrder);
router.post('/recharge/verify', verifyRecharge);
router.post('/pin', setWalletPin);
router.post('/pin/verify', verifyPin);
router.post('/pin/forgot', forgotPin);
router.post('/pin/reset', resetPin);
router.post('/pay', processPayment);

module.exports = router;
