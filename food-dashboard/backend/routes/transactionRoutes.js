const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET all transactions (with optional filters)
router.get('/', transactionController.getAllTransactions);

// GET single transaction
router.get('/:id', transactionController.getTransactionById);

// POST create a new transaction
router.post('/', transactionController.createTransaction);

// PUT update transaction status
router.put('/:id/status', transactionController.updateTransactionStatus);

// GET payment financial summary (today's earnings, total balance, method breakdown)
router.get('/meta/summary', transactionController.getTransactionSummary);

module.exports = router;
