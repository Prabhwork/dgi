const admin = require('firebase-admin');
const path = require('path');

let firebaseApp;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  try {
    let serviceAccount;

    // 1. Try loading from environment variable (Production standard for Render/Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (parseErr) {
        console.error('[FCM] ❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:', parseErr.message);
      }
    }

    // 2. Fallback to local file (Standard for Local Development)
    if (!serviceAccount) {
      try {
        serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));
      } catch (fileErr) {
        console.warn('[FCM] ⚠️  No local firebase-service-account.json found.');
      }
    }

    if (!serviceAccount || serviceAccount.project_id === 'YOUR_FIREBASE_PROJECT_ID') {
      console.warn('[FCM] ⚠️  Firebase configuration is missing or dummy. Push notifications are disabled.');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    }, 'main-backend-app');

    console.log('[FCM] ✅ Firebase Admin SDK initialized (Main Backend)');
    return firebaseApp;
  } catch (err) {
    console.error('[FCM] ❌ Failed to initialize Firebase Admin SDK in main backend:', err.message);
    return null;
  }
};

module.exports = { getFirebaseApp, admin };
