const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET all notifications
router.get('/', notificationController.getAllNotifications);

// POST create notification (system/admin)
router.post('/', notificationController.createNotification);

// PUT mark notification as read
router.put('/:id/read', notificationController.markRead);

// PUT mark all notifications as read
router.put('/mark-all-read', notificationController.markAllRead);

// DELETE notification
router.delete('/:id', notificationController.deleteNotification);

// POST register FCM token
router.post('/register-token', notificationController.registerToken);

module.exports = router;
