const { getFirebaseApp, admin } = require('../config/firebase');
const Notification = require('../models/Notification');

/**
 * Send a notification to a specific device token
 * @param {string} token - The FCM device token
 * @param {object} payload - Notification payload { title, body, data }
 */
exports.sendToToken = async (token, payload) => {
  const app = getFirebaseApp();
  if (!app) return;

  try {
    const message = {
      token: token,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {}
    };

    // Optional Persistence
    if (payload.partnerId || payload.userId) {
        try {
            await Notification.create({
                partnerId: payload.partnerId,
                userId: payload.userId,
                title: payload.title,
                message: payload.body,
                type: payload.type || 'System',
                data: payload.data || {}
            });
        } catch (dbErr) {
            console.error('[FCM] DB Persistence Error:', dbErr);
        }
    }

    const response = await admin.messaging(app).send(message);
    console.log('[FCM] Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('[FCM] Error sending message to token:', error);
  }
};

/**
 * Send a notification to a specific topic
 * @param {string} topic - The topic name
 * @param {object} payload - Notification payload { title, body, data }
 */
exports.sendToTopic = async (topic, payload) => {
  const app = getFirebaseApp();
  if (!app) return;

  try {
    const message = {
      topic: topic,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {}
    };

    // For Topic notifications, we usually persist if a specific target partner/user is provided
    if (payload.partnerId || payload.userId) {
        try {
            await Notification.create({
                partnerId: payload.partnerId,
                userId: payload.userId,
                title: payload.title,
                message: payload.body,
                type: payload.type || 'System',
                data: payload.data || {}
            });
        } catch (dbErr) {
            console.error('[FCM] DB Persistence Error (Topic):', dbErr);
        }
    }

    const response = await admin.messaging(app).send(message);
    console.log(`[FCM] Successfully sent message to topic ${topic}:`, response);
    return response;
  } catch (error) {
    console.error('[FCM] Error sending message to topic:', error);
  }
};

/**
 * Send multiple notifications (multicast)
 * @param {string[]} tokens - Array of device tokens
 * @param {object} payload - Notification payload { title, body, data }
 */
exports.sendMulticast = async (tokens, payload) => {
  const app = getFirebaseApp();
  if (!app) {
    console.warn('[FCM] Skipping multicast - Firebase not initialized');
    return;
  }

  if (!tokens || tokens.length === 0) return;

  try {
    const message = {
      tokens: tokens,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data || {}
    };

    const response = await admin.messaging(app).sendEachForMulticast(message);
    console.log(`[FCM] Successfully sent ${response.successCount} messages; ${response.failureCount} errors.`);

    // Cleanup expired tokens
    if (response.failureCount > 0) {
        const mainDb = require('../config/mainDb');
        response.responses.forEach(async (resp, idx) => {
            if (!resp.success) {
                const error = resp.error;
                if (error.code === 'messaging/invalid-registration-token' || 
                    error.code === 'messaging/registration-token-not-registered') {
                    try {
                        await mainDb.collection('fcmtokens').deleteOne({ token: tokens[idx] });
                        console.log(`[FCM] Cleaned up invalid token: ${tokens[idx].slice(0, 10)}...`);
                    } catch (dbErr) {
                        console.error('[FCM] Failed to cleanup token from DB:', dbErr);
                    }
                }
            }
        });
    }

    return response;
  } catch (error) {
    console.error('[FCM] Error sending multicast message:', error);
  }
};
