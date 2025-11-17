import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { db } from '../firebase'

// Settings
export const getSettings = (callback) => {
  const settingsRef = doc(db, 'settings', 'main')
  return onSnapshot(settingsRef, (doc) => {
    console.log('Settings loaded:', doc.exists() ? doc.data() : 'No data')
    if (doc.exists()) {
      callback(doc.data())
    } else {
      callback({ nextMeetDate: '', relationshipStart: '' })
    }
  }, (error) => {
    console.error('Error loading settings:', error)
  })
}

export const updateNextMeetDate = async (date) => {
  try {
    console.log('Saving date to Firebase:', date)
    const settingsRef = doc(db, 'settings', 'main')
    await setDoc(settingsRef, { nextMeetDate: date }, { merge: true })
    console.log('Date saved successfully!')
  } catch (error) {
    console.error('Error saving date:', error)
    throw error
  }
}

export const updateRelationshipStart = async (date) => {
  const settingsRef = doc(db, 'settings', 'main')
  await setDoc(settingsRef, { relationshipStart: date }, { merge: true })
}

// Date Ideas
export const subscribeDateIdeas = (callback) => {
  const q = query(collection(db, 'dateIdeas'), orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(ideas)
  })
}

export const addDateIdea = async (idea) => {
  await addDoc(collection(db, 'dateIdeas'), {
    ...idea,
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
export const subscribeBooks = (callback) => {
  const q = query(collection(db, 'books'))
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(books)
  })
}

export const addBook = async (book) => {
  await addDoc(collection(db, 'books'), book)
}

export const updateBook = async (id, updates) => {
  const docRef = doc(db, 'books', id)
  await updateDoc(docRef, updates)
}

export const deleteBook = async (id) => {
  await deleteDoc(doc(db, 'books', id))
}

// Shows
export const subscribeShows = (callback) => {
  const q = query(collection(db, 'shows'))
  return onSnapshot(q, (snapshot) => {
    const shows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(shows)
  })
}

export const addShow = async (show) => {
  await addDoc(collection(db, 'shows'), show)
}

export const updateShow = async (id, updates) => {
  const docRef = doc(db, 'shows', id)
  await updateDoc(docRef, updates)
}

export const deleteShow = async (id) => {
  await deleteDoc(doc(db, 'shows', id))
}

// Future Trips
export const subscribeFutureTrips = (callback) => {
  const q = query(collection(db, 'futureTrips'))
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(trips)
  })
}

export const addFutureTrip = async (trip) => {
  await addDoc(collection(db, 'futureTrips'), trip)
}

export const updateFutureTrip = async (id, updates) => {
  const docRef = doc(db, 'futureTrips', id)
  await updateDoc(docRef, updates)
}

export const deleteFutureTrip = async (id) => {
  await deleteDoc(doc(db, 'futureTrips', id))
}

// Dream Trips
export const subscribeDreamTrips = (callback) => {
  const q = query(collection(db, 'dreamTrips'))
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(trips)
  })
}

export const addDreamTrip = async (trip) => {
  await addDoc(collection(db, 'dreamTrips'), trip)
}

export const updateDreamTrip = async (id, updates) => {
  const docRef = doc(db, 'dreamTrips', id)
  await updateDoc(docRef, updates)
}

export const deleteDreamTrip = async (id) => {
  await deleteDoc(doc(db, 'dreamTrips', id))
}

// Special Dates
export const subscribeSpecialDates = (callback) => {
  const q = query(collection(db, 'specialDates'))
  return onSnapshot(q, (snapshot) => {
    const dates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(dates)
  })
}

export const addSpecialDate = async (dateItem) => {
  await addDoc(collection(db, 'specialDates'), dateItem)
}

export const updateSpecialDate = async (id, updates) => {
  const docRef = doc(db, 'specialDates', id)
  await updateDoc(docRef, updates)
}

export const deleteSpecialDate = async (id) => {
  await deleteDoc(doc(db, 'specialDates', id))
}

// Letters
export const getLetters = (callback) => {
  const q = query(collection(db, 'letters'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const letters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(letters)
  })
}

export const addLetter = async (letter) => {
  await addDoc(collection(db, 'letters'), letter)
}

export const deleteLetter = async (id) => {
  await deleteDoc(doc(db, 'letters', id))
}

// Gratitude
export const getGratitudes = (callback) => {
  const q = query(collection(db, 'gratitudes'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const gratitudes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(gratitudes)
  })
}

export const addGratitude = async (gratitude) => {
  await addDoc(collection(db, 'gratitudes'), gratitude)
}

export const deleteGratitude = async (id) => {
  await deleteDoc(doc(db, 'gratitudes', id))
}

// Milestones
export const getMilestones = (callback) => {
  const q = query(collection(db, 'milestones'), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const milestones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(milestones)
  })
}

export const addMilestone = async (milestone) => {
  await addDoc(collection(db, 'milestones'), milestone)
}

export const updateMilestone = async (id, updates) => {
  const docRef = doc(db, 'milestones', id)
  await updateDoc(docRef, updates)
}

export const deleteMilestone = async (id) => {
  await deleteDoc(doc(db, 'milestones', id))
}

// Daily Habits
export const getDailyHabits = (callback) => {
  const q = query(collection(db, 'dailyHabits'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(habits)
  })
}

export const addDailyHabit = async (habit) => {
  await addDoc(collection(db, 'dailyHabits'), habit)
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

export const getAllUserProfiles = (callback) => {
  const q = query(collection(db, 'userProfiles'))
  return onSnapshot(q, (snapshot) => {
    const profiles = {}
    snapshot.docs.forEach(doc => {
      profiles[doc.id] = doc.data()
    })
    callback(profiles)
  })
}
