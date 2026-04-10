const express = require('express');
const router = express.Router();
const BankDetail = require('../models/BankDetail');
const Partner = require('../models/Partner');

const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET bank details for the current user
router.get('/', async (req, res) => {
  try {
    const partnerId = req.partnerId;
    const details = await BankDetail.findOne({ partnerId }).sort({ createdAt: -1 });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST submit bank details
router.post('/', async (req, res) => {
  try {
    const { bankName, branch, accountNumber, holderName, ifscCode } = req.body;
    const partnerId = req.partnerId;
    
    // Fetch partner business name
    const partner = await Partner.findOne({ id: partnerId });
    const partnerBusinessName = partner ? partner.businessName : 'Unknown Business';

    const newDetails = new BankDetail({
      partnerId,
      partnerBusinessName,
      bankName,
      branch,
      accountNumber,
      holderName,
      ifscCode,
      status: 'Approved' // Auto-approve for now (as per legacy behavior)
    });
    const saved = await newDetails.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
