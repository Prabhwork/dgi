const mongoose = require('mongoose');

const bankDetailSchema = new mongoose.Schema({
  partnerId: { type: String, required: true },
  partnerBusinessName: { type: String },
  bankName: { type: String, required: true },
  branch: { type: String },
  accountNumber: { type: String, required: true },
  holderName: { type: String, required: true },
  ifscCode: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BankDetail', bankDetailSchema);
