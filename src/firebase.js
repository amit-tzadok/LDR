import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics"
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// TODO: Replace with your Firebase config
// Get this from Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCjhVGXFNBWGBusv0ueBEbo0ChlqSArFmA",
  authDomain: "ldr-app-923ac.firebaseapp.com",
  projectId: "ldr-app-923ac",
  storageBucket: "ldr-app-923ac.firebasestorage.app",
  messagingSenderId: "586642496044",
  appId: "1:586642496044:web:cf1430b28ad7ca02b2cf89",
  measurementId: "G-KN6PSBQNRQ"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
const analytics = getAnalytics(app)

// Initialize Firebase Cloud Messaging
let messaging = null
if ('serviceWorker' in navigator && 'Notification' in window) {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.log('Messaging not supported:', error)
  }
}

export { messaging, getToken, onMessage }
export default app
