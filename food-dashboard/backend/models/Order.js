const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true, index: true },
  userId: { type: String, index: true }, // ID of the logged-in user who placed the order
  customer: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },
  items: { type: Array, required: true },
  itemsArray: { type: Array, default: [] }, // Stores structured item data
  total: { type: Number, required: true },
  subtotal: { type: Number },
  tax: { type: Number },
  restaurantCharges: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  prepTime: { type: Number, default: 0 }, // Max prepTime of items
  status: { type: String, enum: ['Pending','Accepted','Preparing','Ready','Completed'], default: 'Pending' },
  acceptedAt: { type: Date }, // Timestamp when partner accepts
  preparingAt: { type: Date }, // Timestamp when preparation starts
  readyAt: { type: Date }, // Timestamp when order is marked as Ready
  payment: { type: String, enum: ['Paid','Pending'], default: 'Pending' },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  razorpayPaymentId: { type: String },
  orderType: { type: String, enum: ['Takeaway', 'Dine-in'], default: 'Takeaway' },
  tableNumber: { type: String },
  time: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
