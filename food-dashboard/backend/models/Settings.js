const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  partnerId:     { type: String, required: true, unique: true, index: true },
  businessName:  { type: String, default: 'Restaurant Partner' },
  contact:       { type: String, default: '' },
  address:       { type: String, default: '' },
  coverPhotoUrl: { type: String, default: '' },
  logoUrl:       { type: String, default: '' },
  gstin:         { type: String, default: '' },
  fssai:        { type: String, default: '' },
  isLive:       { type: Boolean, default: true },
  autoAcceptOrders: { type: Boolean, default: true  },
  autoPrintKOT:     { type: Boolean, default: false },
  notifications: {
    newOrderAlerts:   { type: Boolean, default: true  },
    whatsappUpdates:  { type: Boolean, default: true  },
    smsBackup:        { type: Boolean, default: false },
    emailInvoices:    { type: Boolean, default: true  },
  },
  businessHours: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      Monday:    [{ from: '11:30 AM', to: '04:00 PM' }, { from: '07:00 PM', to: '11:30 PM' }],
      Tuesday:   [{ from: '11:30 AM', to: '04:00 PM' }, { from: '07:00 PM', to: '11:30 PM' }],
      Wednesday: [{ from: '11:30 AM', to: '04:00 PM' }, { from: '07:00 PM', to: '11:30 PM' }],
      Thursday:  [{ from: '11:30 AM', to: '04:00 PM' }, { from: '07:00 PM', to: '11:30 PM' }],
      Friday:    [{ from: '11:30 AM', to: '04:00 PM' }, { from: '07:00 PM', to: '11:30 PM' }],
      Saturday:  [{ from: '11:30 AM', to: '11:30 PM' }],
      Sunday:    [{ from: '12:00 PM', to: '10:00 PM' }],
    }
  },
  twoFactorEnabled: { type: Boolean, default: true },
  taxPercentage: { type: Number, default: 5 },
  restaurantCharges: { type: Number, default: 0 },
  dineoutBookingFee: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
