const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true, index: true },
  type: { type: String, enum: ['Salary', 'MerchantPayout'], default: 'Salary' },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed'], default: 'Pending' }, // For Merchant payouts
  bank: { type: String }, // For Merchant payouts
  
  // Staff Salary Specific (Optional for Merchant payouts)
  staffId: { type: String },
  month: { type: Number },
  year: { type: Number },
  paymentMethod: { type: String, enum: ['Cash', 'Online'] },
  absencesRef: { type: Number },
  deductionRef: { type: Number },
  transactionId: { type: String },
  
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
}, { timestamps: true });

// Ensure one salary payout per staff per month/year WITHIN the same partner
// Only apply unique constraint to 'Salary' type records
settlementSchema.index({ partnerId: 1, staffId: 1, month: 1, year: 1, type: 1 }, { 
  unique: true, 
  partialFilterExpression: { type: 'Salary' } 
});

module.exports = mongoose.model('Settlement', settlementSchema);
