const mongoose = require('mongoose');

const FunnelQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true
  },
  options: [
    {
      label: { type: String, required: true },
      icon: { type: String, default: 'MoreHorizontal' },
      color: { type: String, default: 'from-blue-500 to-cyan-400' }
    }
  ],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FunnelQuestion', FunnelQuestionSchema);
