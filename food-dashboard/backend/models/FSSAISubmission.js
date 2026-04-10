const mongoose = require('mongoose');

const fssaiSubmissionSchema = new mongoose.Schema({
  partnerId:      { type: String, required: true },
  businessName:   { type: String, required: true },
  fssaiNumber:    { type: String, required: true },
  fssaiImageUrl:  { type: String, default: '' },
  status:         { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminNote:      { type: String, default: '' },
  reviewedAt:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('FSSAISubmission', fssaiSubmissionSchema);
