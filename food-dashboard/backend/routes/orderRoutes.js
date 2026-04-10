const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protectPartner } = require('../middleware/auth');

// POST create new order - Public (for customer checkout)
router.post('/', orderController.createOrder);

// GET orders for a specific user - Public (for user profile page)
router.get('/user/:userId', orderController.getOrdersByUserId);

// GET single order by custom id - Public (for customer tracking)
router.get('/:id', orderController.getOrderById);

router.use(protectPartner);

// GET all orders (with optional status filter)
router.get('/', orderController.getAllOrders);

// PUT update order status (advance to next status)
router.put('/:id/status', orderController.updateOrderStatus);

// DELETE order
router.delete('/:id', orderController.deleteOrder);

// GET dashboard stats computed from orders
router.get('/meta/stats', orderController.getOrderStats);

module.exports = router;
