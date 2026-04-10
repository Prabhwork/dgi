// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDGZDZyCegy4uiEcJcwRQVzyH_FWPjqE1I",
  authDomain: "digital-606e3.firebaseapp.com",
  projectId: "digital-606e3",
  storageBucket: "digital-606e3.firebasestorage.app",
  messagingSenderId: "903942871669",
  appId: "1:903942871669:web:610323d083e94b71acf63c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
