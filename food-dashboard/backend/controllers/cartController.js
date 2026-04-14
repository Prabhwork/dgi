const Cart = require('../models/Cart');

// GET cart for a user
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPSERT cart (Save or Update)
exports.saveCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE cart (Clear)
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.findOneAndDelete({ userId });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
