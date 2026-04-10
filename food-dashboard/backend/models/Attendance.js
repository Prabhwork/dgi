const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: { type: String, required: true }, // Using staff.id (ST-XXX) for easier reference
  partnerId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Uninformed', 'Half-Day'], default: 'Present' },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true }
}, { timestamps: true });

// Ensure one record per staff per day WITHIN the same partner/business
attendanceSchema.index({ partnerId: 1, staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
