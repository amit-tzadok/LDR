import { messaging, getToken, onMessage } from '../firebase'

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.log('Messaging not supported')
      return null
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('Notification permission granted')
      
      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'A69wF0vMYT4W0IXrUl1saXei9-qx_MF-xXZqd_voYu4', // You'll need to generate this in Firebase Console
        serviceWorkerRegistration: registration
      })
      
      if (token) {
        console.log('FCM Token:', token)
        // TODO: Save token to Firestore for sending notifications
        return token
      } else {
        console.log('No registration token available')
        return null
      }
    } else {
      console.log('Notification permission denied')
      return null
    }
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging not supported')
      return
    }
    
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload)
      resolve(payload)
    })
  })
}

// Show notification
export const showNotification = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/heart-icon.png',
      badge: '/heart-badge.png',
      vibrate: [200, 100, 200],
      tag: 'ldr-notification'
    })
  }
}
