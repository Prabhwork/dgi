const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  items: [{
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    partnerId: { type: String, required: true },
    restaurantName: { type: String },
    isVeg: { type: Boolean },
    prepTime: { type: Number }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
