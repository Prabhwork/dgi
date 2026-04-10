import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🚨 PASTE YOUR FIREBASE CONFIG FROM PROJECT SETTINGS HERE
const firebaseConfig = {
  apiKey: "AIzaSyDGZDZyCegy4uiEcJcwRQVzyH_FWPjqE1I",
  authDomain: "digital-606e3.firebaseapp.com",
  projectId: "digital-606e3",
  storageBucket: "digital-606e3.firebasestorage.app",
  messagingSenderId: "903942871669",
  appId: "1:903942871669:web:610323d083e94b71acf63c",
  measurementId: "G-GYDDRWB6EQ"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return;
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      console.log("FCM Token secured (Main Admin):", currentToken);
      
      // Auto-register with backend if possible
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        try {
          await fetch(`${apiBase}/notifications/register-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token: currentToken, deviceType: 'web' })
          });
          console.log("[FCM] Registered token with Main Admin backend");
        } catch (regErr) {
          console.warn("[FCM] Main Admin Backend registration failed", regErr);
        }
      }
      return currentToken;
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
