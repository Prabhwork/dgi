const Transaction = require('../models/Transaction');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || req.partnerId;

// GET all transactions (Partitioned by Partner)
exports.getAllTransactions = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.method) filter.method = req.query.method;
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single transaction (enforcing partner isolation)
exports.getTransactionById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const txn = await Transaction.findOne({ id: req.params.id, partnerId });
    if (!txn) return res.status(404).json({ message: 'Transaction not found or access denied' });
    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create a new transaction (automatically assigning current partnerId)
exports.createTransaction = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const count = await Transaction.countDocuments({ partnerId });
    const newId = `TXN-${partnerId.split('-')[0].toUpperCase()}-${9900 + count + 1}`;
    const txn = new Transaction({ ...req.body, id: newId, partnerId });
    const saved = await txn.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update transaction status (enforcing partner isolation)
exports.updateTransactionStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const txn = await Transaction.findOneAndUpdate(
      { id: req.params.id, partnerId },
      { status: req.body.status },
      { new: true }
    );
    if (!txn) return res.status(404).json({ message: 'Transaction not found or access denied' });
    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET financial summary (Partitioned by Partner)
exports.getTransactionSummary = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const allPaid = await Transaction.find({ partnerId, status: 'Paid' });
    const totalBalance = allPaid.reduce((acc, t) => acc + t.amount, 0);

    // Today's transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayPaid = await Transaction.find({ 
      partnerId, 
      status: 'Paid', 
      createdAt: { $gte: todayStart } 
    });
    const todayEarnings = todayPaid.reduce((acc, t) => acc + t.amount, 0);

    // Status counts
    const paid = await Transaction.countDocuments({ partnerId, status: 'Paid' });
    const pending = await Transaction.countDocuments({ partnerId, status: 'Pending' });
    const failed = await Transaction.countDocuments({ partnerId, status: 'Failed' });
    const total = paid + pending + failed;

    // Method breakdown
    const methodAgg = await Transaction.aggregate([
      { $match: { partnerId } },
      { $group: { _id: '$method', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalBalance,
      todayEarnings,
      paidPercent: total ? Math.round((paid / total) * 100) : 0,
      pendingPercent: total ? Math.round((pending / total) * 100) : 0,
      failedPercent: total ? Math.round((failed / total) * 100) : 0,
      methodBreakdown: methodAgg,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
