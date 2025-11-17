import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { db } from '../firebase'

// Settings - couple-specific
export const getSettings = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const settingsRef = doc(db, 'settings', coupleCode)
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    } else {
      callback({ nextMeetDate: '', relationshipStart: '' })
    }
  })
}

export const updateNextMeetDate = async (coupleCode, date) => {
  if (!coupleCode) return
  const settingsRef = doc(db, 'settings', coupleCode)
  await setDoc(settingsRef, { nextMeetDate: date, coupleCode }, { merge: true })
}

export const updateRelationshipStart = async (coupleCode, date) => {
  if (!coupleCode) return
  const settingsRef = doc(db, 'settings', coupleCode)
  await setDoc(settingsRef, { relationshipStart: date, coupleCode }, { merge: true })
}

// Date Ideas
export const subscribeDateIdeas = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'dateIdeas'), where('coupleCode', '==', coupleCode), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(ideas)
  })
}

export const addDateIdea = async (coupleCode, idea) => {
  await addDoc(collection(db, 'dateIdeas'), {
    ...idea,
    coupleCode,
    timestamp: serverTimestamp(),
    completed: false
  })
}

export const updateDateIdea = async (id, updates) => {
  const docRef = doc(db, 'dateIdeas', id)
  await updateDoc(docRef, updates)
}

export const deleteDateIdea = async (id) => {
  await deleteDoc(doc(db, 'dateIdeas', id))
}

// Books
export const subscribeBooks = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'books'), where('coupleCode', '==', coupleCode))
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(books)
  })
}

export const addBook = async (coupleCode, book) => {
  await addDoc(collection(db, 'books'), { ...book, coupleCode })
}

export const updateBook = async (id, updates) => {
  const docRef = doc(db, 'books', id)
  await updateDoc(docRef, updates)
}

export const deleteBook = async (id) => {
  await deleteDoc(doc(db, 'books', id))
}

// Shows
export const subscribeShows = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'shows'), where('coupleCode', '==', coupleCode))
  return onSnapshot(q, (snapshot) => {
    const shows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(shows)
  })
}

export const addShow = async (coupleCode, show) => {
  await addDoc(collection(db, 'shows'), { ...show, coupleCode })
}

export const updateShow = async (id, updates) => {
  const docRef = doc(db, 'shows', id)
  await updateDoc(docRef, updates)
}

export const deleteShow = async (id) => {
  await deleteDoc(doc(db, 'shows', id))
}

// Future Trips
export const subscribeFutureTrips = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'futureTrips'), where('coupleCode', '==', coupleCode))
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(trips)
  })
}

export const addFutureTrip = async (coupleCode, trip) => {
  await addDoc(collection(db, 'futureTrips'), { ...trip, coupleCode })
}

export const updateFutureTrip = async (id, updates) => {
  const docRef = doc(db, 'futureTrips', id)
  await updateDoc(docRef, updates)
}

export const deleteFutureTrip = async (id) => {
  await deleteDoc(doc(db, 'futureTrips', id))
}

// Dream Trips
export const subscribeDreamTrips = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'dreamTrips'), where('coupleCode', '==', coupleCode))
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(trips)
  })
}

export const addDreamTrip = async (coupleCode, trip) => {
  await addDoc(collection(db, 'dreamTrips'), { ...trip, coupleCode })
}

export const updateDreamTrip = async (id, updates) => {
  const docRef = doc(db, 'dreamTrips', id)
  await updateDoc(docRef, updates)
}

export const deleteDreamTrip = async (id) => {
  await deleteDoc(doc(db, 'dreamTrips', id))
}

// Special Dates
export const subscribeSpecialDates = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'specialDates'), where('coupleCode', '==', coupleCode))
  return onSnapshot(q, (snapshot) => {
    const dates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(dates)
  })
}

export const addSpecialDate = async (coupleCode, dateItem) => {
  await addDoc(collection(db, 'specialDates'), { ...dateItem, coupleCode })
}

export const updateSpecialDate = async (id, updates) => {
  const docRef = doc(db, 'specialDates', id)
  await updateDoc(docRef, updates)
}

export const deleteSpecialDate = async (id) => {
  await deleteDoc(doc(db, 'specialDates', id))
}

// Letters
export const getLetters = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'letters'), where('coupleCode', '==', coupleCode), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const letters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(letters)
  }, (error) => {
    console.error('Error in getLetters snapshot:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    if (error.code === 'failed-precondition') {
      console.error('INDEX NEEDED! Check console for the link to create it.')
    }
  })
}

export const addLetter = async (coupleCode, letter) => {
  await addDoc(collection(db, 'letters'), { ...letter, coupleCode })
}

export const deleteLetter = async (id) => {
  await deleteDoc(doc(db, 'letters', id))
}

// Gratitude
export const getGratitudes = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'gratitudes'), where('coupleCode', '==', coupleCode), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const gratitudes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(gratitudes)
  })
}

export const addGratitude = async (coupleCode, gratitude) => {
  await addDoc(collection(db, 'gratitudes'), { ...gratitude, coupleCode })
}

export const deleteGratitude = async (id) => {
  await deleteDoc(doc(db, 'gratitudes', id))
}

// Milestones
export const getMilestones = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'milestones'), where('coupleCode', '==', coupleCode), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const milestones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(milestones)
  })
}

export const addMilestone = async (coupleCode, milestone) => {
  await addDoc(collection(db, 'milestones'), { ...milestone, coupleCode })
}

export const updateMilestone = async (id, updates) => {
  const docRef = doc(db, 'milestones', id)
  await updateDoc(docRef, updates)
}

export const deleteMilestone = async (id) => {
  await deleteDoc(doc(db, 'milestones', id))
}

// Daily Habits
export const getDailyHabits = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'dailyHabits'), where('coupleCode', '==', coupleCode), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(habits)
  })
}

export const addDailyHabit = async (coupleCode, habit) => {
  await addDoc(collection(db, 'dailyHabits'), { ...habit, coupleCode })
}

export const updateDailyHabit = async (id, updates) => {
  const docRef = doc(db, 'dailyHabits', id)
  await updateDoc(docRef, updates)
}

export const deleteDailyHabit = async (id) => {
  await deleteDoc(doc(db, 'dailyHabits', id))
}

// User Profiles
export const getUserProfile = async (userId) => {
  const profileRef = doc(db, 'userProfiles', userId)
  const profileDoc = await getDoc(profileRef)
  return profileDoc.exists() ? profileDoc.data() : null
}

export const subscribeUserProfile = (userId, callback) => {
  const profileRef = doc(db, 'userProfiles', userId)
  return onSnapshot(profileRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    } else {
      callback(null)
    }
  })
}

export const createUserProfile = async (userId, profileData) => {
  const profileRef = doc(db, 'userProfiles', userId)
  await setDoc(profileRef, {
    ...profileData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export const updateUserProfile = async (userId, updates) => {
  const profileRef = doc(db, 'userProfiles', userId)
  await setDoc(profileRef, {
    ...updates,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export const getAllUserProfiles = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'userProfiles'), where('coupleCode', '==', coupleCode))
  return onSnapshot(q, (snapshot) => {
    const profiles = {}
    snapshot.docs.forEach(doc => {
      profiles[doc.id] = doc.data()
    })
    callback(profiles)
  })
}
