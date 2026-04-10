const Notification = require('../models/Notification');
const FcmToken = require('../models/FcmToken');

// @desc    Get all notifications for logged-in user or admin
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'admin') {
            query.adminId = req.user._id;
        } else {
            query.userId = req.user._id;
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role === 'admin') {
            query.adminId = req.user._id;
        } else {
            query.userId = req.user._id;
        }

        const notification = await Notification.findOneAndUpdate(
            query,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllRead = async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'admin') {
            query.adminId = req.user._id;
        } else {
            query.userId = req.user._id;
        }

        await Notification.updateMany({ ...query, read: false }, { read: true });

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role === 'admin') {
            query.adminId = req.user._id;
        } else {
            query.userId = req.user._id;
        }

        const notification = await Notification.findOneAndDelete(query);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Register FCM Token
// @route   POST /api/notifications/register-token
// @access  Private
exports.registerToken = async (req, res) => {
    try {
        const { token, deviceType } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        const query = {};
        if (req.user.role === 'admin') {
            query.adminId = req.user._id;
        } else {
            query.userId = req.user._id;
        }

        await FcmToken.findOneAndUpdate(
            { ...query, token },
            { ...query, token, deviceType, lastUsed: new Date() },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'FCM Token registered' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
