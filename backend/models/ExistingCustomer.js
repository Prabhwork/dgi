const mongoose = require('mongoose');

const ExistingCustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a customer name']
  },
  logo: {
    type: String,
    default: 'no-photo.jpg'
  },
  link: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
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

module.exports = mongoose.model('ExistingCustomer', ExistingCustomerSchema);
