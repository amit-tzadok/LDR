/* eslint-disable */
// Import the functions you need from the SDKs you need
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration
// Replace with your actual Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyCjhVGXFNBWGBusv0ueBEbo0ChlqSArFmA",
  authDomain: "ldr-app-923ac.firebaseapp.com",
  projectId: "ldr-app-923ac",
  storageBucket: "ldr-app-923ac.firebasestorage.app",
  messagingSenderId: "586642496044",
  appId: "1:586642496044:web:cf1430b28ad7ca02b2cf89",
  measurementId: "G-KN6PSBQNRQ"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/heart-icon.png',
    badge: '/heart-badge.png',
    vibrate: [200, 100, 200],
    tag: 'ldr-notification',
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
