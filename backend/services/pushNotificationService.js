const { getFirebaseApp, admin } = require('../config/firebase');
const FcmToken = require('../models/FcmToken');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Send a push notification to a user and save it to the database
 * @param {string} userId - ID of the user
 * @param {object} payload - { title, body, type, data }
 */
exports.sendPushNotification = async (userId, payload) => {
    const app = getFirebaseApp();
    if (!app) {
        console.warn('[FCM] Skipping push - Firebase not initialized');
        return await saveToDb(userId, payload);
    }

    try {
        // 1. Get user tokens
        const userTokens = await FcmToken.find({ userId: new mongoose.Types.ObjectId(userId) });
        const tokens = userTokens.map(t => t.token);

        if (tokens.length === 0) {
            console.log(`[FCM] No registered tokens for user ${userId}`);
            return await saveToDb(userId, payload);
        }

        // 2. Prepare message
        const message = {
            notification: {
                title: payload.title,
                body: payload.body
            },
            data: payload.data || {},
        };

        // 3. Send multicast
        const response = await admin.messaging(app).sendEachForMulticast({
            tokens,
            ...message
        });

        console.log(`[FCM] Sent to ${response.successCount} devices, failures: ${response.failureCount}`);

        // 4. Cleanup expired tokens if any
        if (response.failureCount > 0) {
            response.responses.forEach(async (resp, idx) => {
                if (!resp.success) {
                    const error = resp.error;
                    if (error.code === 'messaging/invalid-registration-token' || 
                        error.code === 'messaging/registration-token-not-registered') {
                        await FcmToken.deleteOne({ token: tokens[idx] });
                    }
                }
            });
        }

        // 5. Always save to database for in-app inbox
        return await saveToDb(userId, payload);

    } catch (err) {
        console.error('[FCM] Error sending push notification:', err);
        return await saveToDb(userId, payload);
    }
};

/**
 * Save notification to database
 */
async function saveToDb(userId, payload) {
    try {
        const notification = await Notification.create({
            userId: new mongoose.Types.ObjectId(userId),
            title: payload.title,
            message: payload.body,
            type: payload.type || 'System',
            data: payload.data || {},
            read: false,
            createdAt: new Date()
        });
        return notification;
    } catch (err) {
        console.error('[FCM] DB Save Error:', err);
    }
}
