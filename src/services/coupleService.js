import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../firebase'

// Generate a unique couple code
export const generateCoupleCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

// Create a new couple when first user signs up
export const createCouple = async (userId, userName, userEmail) => {
  const coupleCode = generateCoupleCode()
  const coupleRef = doc(db, 'couples', coupleCode)
  
  await setDoc(coupleRef, {
    code: coupleCode,
    createdAt: serverTimestamp(),
    createdBy: userId,
    members: [userId],
    memberDetails: {
      [userId]: {
        name: userName,
        email: userEmail,
        joinedAt: serverTimestamp()
      }
    }
  })
  
  // Update user profile with couple code
  const userRef = doc(db, 'userProfiles', userId)
  await setDoc(userRef, {
    coupleCode: coupleCode,
    name: userName,
    email: userEmail,
    createdAt: serverTimestamp()
  }, { merge: true })
  
  return coupleCode
}

// Join an existing couple with code
export const joinCouple = async (userId, userName, userEmail, coupleCode) => {
  const coupleRef = doc(db, 'couples', coupleCode.toUpperCase())
  const coupleDoc = await getDoc(coupleRef)
  
  if (!coupleDoc.exists()) {
    throw new Error('Invalid couple code')
  }
  
  const coupleData = coupleDoc.data()
  
  if (coupleData.members.length >= 2) {
    throw new Error('This couple already has 2 members')
  }
  
  // Add user to couple
  await updateDoc(coupleRef, {
    members: [...coupleData.members, userId],
    [`memberDetails.${userId}`]: {
      name: userName,
      email: userEmail,
      joinedAt: serverTimestamp()
    }
  })
  
  // Update user profile with couple code
  const userRef = doc(db, 'userProfiles', userId)
  await setDoc(userRef, {
    coupleCode: coupleCode.toUpperCase(),
    name: userName,
    email: userEmail,
    createdAt: serverTimestamp()
  }, { merge: true })
  
  return coupleCode.toUpperCase()
}

// Get user's couple code
export const getUserCoupleCode = async (userId) => {
  const userRef = doc(db, 'userProfiles', userId)
  const userDoc = await getDoc(userRef)
  
  if (userDoc.exists()) {
    return userDoc.data().coupleCode || null
  }
  return null
}

// Get couple details
export const getCoupleDetails = async (coupleCode) => {
  const coupleRef = doc(db, 'couples', coupleCode)
  const coupleDoc = await getDoc(coupleRef)
  
  if (coupleDoc.exists()) {
    return coupleDoc.data()
  }
  return null
}
