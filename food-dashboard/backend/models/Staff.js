const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Uninformed', 'None'], default: 'None' },
  isSuspended: { type: Boolean, default: false },
  salary: { type: Number, required: true },
  allowedLeaves: { type: Number, default: 2 },
  absences: { type: Number, default: 0 },
  lastClockIn: { type: String },
  advance: { type: Number, default: 0 },
  joined: { type: String },
  phone: { type: String },
  bankAccount: { type: String },
  upiId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
