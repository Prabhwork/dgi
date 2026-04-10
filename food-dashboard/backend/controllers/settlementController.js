const Settlement = require('../models/Settlement');
const Order = require('../models/Order');
const BankDetail = require('../models/BankDetail');
const Partner = require('../models/Partner');
const fcmService = require('../services/fcmService');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// GET all settlements (Partner side - partitioned, Merchant Payouts only)
exports.getAllSettlements = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId, type: 'MerchantPayout' };
    if (req.query.status) filter.status = req.query.status;
    const settlements = await Settlement.find(filter).sort({ createdAt: -1 });
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all pending settlements (Admin side - Payouts only, optional partner filter)
exports.adminGetPendingSettlements = async (req, res) => {
  try {
    const filter = { type: 'MerchantPayout', status: 'Pending' };
    if (req.query.partnerId) filter.partnerId = req.query.partnerId;
    
    const settlements = await Settlement.find(filter).sort({ createdAt: 1 });
    res.json(settlements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST request a payout (Partner side - partitioned)
exports.requestPayout = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    
    // 1. Check if bank is linked and approved
    const bank = await BankDetail.findOne({ partnerId, status: 'Approved' });
    if (!bank) {
      return res.status(400).json({ message: 'No approved bank account linked. Please setup your bank account first.' });
    }

    // 2. Calculate balance for current partner (Excluding Salaries)
    const orders = await Order.find({ partnerId, status: 'Completed', payment: 'Paid' });
    const totalEarnings = orders.reduce((acc, o) => acc + o.total, 0);
    
    const settlements = await Settlement.find({ 
      partnerId, 
      type: 'MerchantPayout',
      status: { $in: ['Pending', 'Processing', 'Completed'] } 
    });
    const totalWithdrawn = settlements.reduce((acc, s) => acc + s.amount, 0);
    
    const redeemableBalance = totalEarnings - totalWithdrawn;
    const requestedAmount = req.body.amount || redeemableBalance;

    if (requestedAmount <= 0) {
      return res.status(400).json({ message: 'Insufficient balance for payout.' });
    }
    if (requestedAmount > redeemableBalance) {
      return res.status(400).json({ message: `Requested amount exceeds available balance (₹${redeemableBalance}).` });
    }

    // 3. Create settlement request
    const count = await Settlement.countDocuments({ partnerId });
    const partnerPrefix = partnerId.split('-')[0].toUpperCase();
    const newId = `SET-${partnerPrefix}-${1220 + count + 1}`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const partner = await Partner.findOne({ id: partnerId });

    const settlement = new Settlement({
      id: newId,
      partnerId,
      type: 'MerchantPayout',
      partnerBusinessName: partner ? partner.businessName : 'Unknown Business',
      date: today,
      amount: requestedAmount,
      status: 'Pending',
      bank: `${bank.bankName} (**** ${bank.accountNumber.slice(-4)})`,
      requestedAt: new Date()
    });

    const saved = await settlement.save();

    // Trigger FCM Notification for Payout Request (to Main Admin)
    try {
        await fcmService.sendToTopic('dbi-admin-alerts', {
            title: '💸 New Payout Request!',
            body: `${partner ? partner.businessName : partnerId} requested a payout of ₹${requestedAmount.toFixed(0)}`,
            adminId: 'MASTER_ADMIN_ID_PLACEHOLDER', // In a real system, we'd fetch master admin IDs
            type: 'Payment',
            data: { settlementId: saved.id, partnerId: partnerId, type: 'PAYOUT_REQUEST' }
        });
    } catch (fcmErr) {
        console.error("FCM Payout Request Error:", fcmErr);
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET wallet overview (Partitioned by Partner)
exports.getWalletOverview = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    
    // Total Earnings from Paid Completed Orders
    const orders = await Order.find({ partnerId, status: 'Completed', payment: 'Paid' });
    const lifetimeEarnings = orders.reduce((acc, o) => acc + o.total, 0);

    // Total Withdrawn (Merchant Payouts - Completed)
    const completedSettlements = await Settlement.find({ 
      partnerId, 
      type: 'MerchantPayout', 
      status: 'Completed' 
    });
    const totalWithdrawn = completedSettlements.reduce((acc, s) => acc + s.amount, 0);

    // Pending/Processing Withdrawals (Merchant Payouts)
    const inTransitSettlements = await Settlement.find({ 
      partnerId, 
      type: 'MerchantPayout',
      status: { $in: ['Pending', 'Processing'] } 
    });
    const inTransitAmount = inTransitSettlements.reduce((acc, s) => acc + s.amount, 0);

    const redeemableBalance = lifetimeEarnings - totalWithdrawn - inTransitAmount;

    // Bank Detail status
    const bank = await BankDetail.findOne({ partnerId }).sort({ createdAt: -1 });

    res.json({
      redeemableBalance,
      lifetimeEarnings,
      partnerId,
      totalSettlements: completedSettlements.length,
      nextSettlement: 'Manual Request',
      linkedBank: bank ? `${bank.bankName} **** ${bank.accountNumber.slice(-4)}` : 'Not Linked',
      bankStatus: bank ? bank.status : 'None'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
