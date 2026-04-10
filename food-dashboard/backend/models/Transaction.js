const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true, index: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
  method: { type: String, enum: ['UPI', 'Wallet', 'COD', 'Card', 'Net Banking', 'Online'], required: true },
  date: { type: String },
  gatewayRef: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
