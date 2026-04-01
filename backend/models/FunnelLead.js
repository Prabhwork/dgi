const mongoose = require('mongoose');

const FunnelLeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name']
  },
  description: {
    type: String,
    required: false
  },
  answers: {
    type: Object, // Store JSON of question-answer pairs
    default: {}
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'closed'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FunnelLead', FunnelLeadSchema);
