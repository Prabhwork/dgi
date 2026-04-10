const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
    getNotifications, 
    markAsRead, 
    markAllRead, 
    deleteNotification,
    registerToken 
} = require('../controllers/notificationController');

// Token registration
router.post('/register-token', protect, registerToken);

// Notification management
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
