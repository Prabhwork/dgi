const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, default: 'Partner' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
  category: { type: String, default: 'Restaurant' }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
