const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// All cart routes are public for now or identified via userId in URL
// Since the frontend is passing the userId directly from their profile.
router.get('/:userId', cartController.getCart);
router.post('/:userId', cartController.saveCart);
router.delete('/:userId', cartController.clearCart);

module.exports = router;
