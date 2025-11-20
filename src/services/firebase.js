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
  setDoc,
  getDocs
} from 'firebase/firestore'
import { db } from '../firebase'

// Couples Management
export const createCouple = async (userId, userEmail) => {
  const coupleCode = Math.random().toString(36).substring(2, 10).toUpperCase()
  const pairInviteCode = Math.random().toString(36).substring(2, 15).toLowerCase()
  const trioInviteCode = Math.random().toString(36).substring(2, 15).toLowerCase()
  
  const coupleData = {
    code: coupleCode, // For backwards compatibility with old system
    coupleCode,
    inviteCode: pairInviteCode, // Keep old field for backwards compatibility
    pairInviteCode, // For joining as 2nd member
    trioInviteCode, // For joining as 3rd member
    members: [userId],
    createdAt: serverTimestamp(),
    createdBy: userId
  }
  
  await setDoc(doc(db, 'couples', coupleCode), coupleData)
  
  // Get current user profile to preserve existing couples
  const userRef = doc(db, 'userProfiles', userId)
  const userDoc = await getDoc(userRef)
  const currentCouples = userDoc.exists() ? (userDoc.data().couples || []) : []
  
  // Add to couples array and set as active
  await updateUserProfile(userId, { 
    coupleCode, // Keep for backwards compatibility
    couples: [...currentCouples, coupleCode],
    activeCoupleCode: coupleCode
  })
  
  return { coupleCode, pairInviteCode, trioInviteCode }
}

export const joinCouple = async (inviteCode, userId) => {
  console.log('joinCouple called with:', { inviteCode, userId })
  
  // Find couple by invite code (case-insensitive) - check both pairInviteCode and trioInviteCode
  const couplesRef = collection(db, 'couples')
  const normalizedCode = inviteCode.toLowerCase()
  
  // Search for couples with matching pairInviteCode or trioInviteCode
  const allCouplesSnapshot = await getDocs(couplesRef)
  let coupleDoc = null
  let inviteType = null
  
  for (const doc of allCouplesSnapshot.docs) {
    const data = doc.data()
    if (data.pairInviteCode === normalizedCode || data.inviteCode === normalizedCode) {
      coupleDoc = doc
      inviteType = 'pair'
      break
    } else if (data.trioInviteCode === normalizedCode) {
      coupleDoc = doc
      inviteType = 'trio'
      break
    }
  }
  
  if (!coupleDoc) {
    throw new Error(`Invalid invite code "${inviteCode}" - no couple found with this code. Please double-check the code and try again.`)
  }
  
  const coupleData = coupleDoc.data()
  const coupleCode = coupleDoc.id
  const currentMemberCount = coupleData.members?.length || 0
  
  console.log('Found couple:', { coupleCode, members: coupleData.members, inviteType, currentMemberCount })
  
  // Check if already a member
  if (coupleData.members.includes(userId)) {
    throw new Error('You are already a member of this space')
  }
  
  // Enforce 3-member limit
  if (currentMemberCount >= 3) {
    throw new Error('This space already has the maximum of 3 members')
  }
  
  // Validate invite code type matches current member count
  if (inviteType === 'pair' && currentMemberCount !== 1) {
    throw new Error('This invite code is for joining as a pair (2 people total). This space already has ' + currentMemberCount + ' member(s).')
  }
  
  if (inviteType === 'trio' && currentMemberCount !== 2) {
    throw new Error('This invite code is for joining as a third person. This space needs exactly 2 existing members, but has ' + currentMemberCount + '.')
  }
  
  // Add user to couple
  await updateDoc(doc(db, 'couples', coupleCode), {
    members: [...coupleData.members, userId]
  })
  
  console.log('Updated couple members')
  
  // Get current user profile to preserve existing couples
  const userRef = doc(db, 'userProfiles', userId)
  const userDoc = await getDoc(userRef)
  const currentCouples = userDoc.exists() ? (userDoc.data().couples || []) : []
  
  // Add to couples array if not already there
  const updatedCouples = currentCouples.includes(coupleCode) 
    ? currentCouples 
    : [...currentCouples, coupleCode]
  
  // Update user profile with couples array and set as active
  await updateUserProfile(userId, { 
    coupleCode, // Keep for backwards compatibility
    couples: updatedCouples,
    activeCoupleCode: coupleCode
  })
  
  console.log('Updated user profile - added to couples:', coupleCode)
  
  return coupleCode
}

export const getCouple = async (coupleCode) => {
  const coupleRef = doc(db, 'couples', coupleCode)
  const coupleDoc = await getDoc(coupleRef)
  return coupleDoc.exists() ? { id: coupleDoc.id, ...coupleDoc.data() } : null
}

export const subscribeCouple = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const coupleRef = doc(db, 'couples', coupleCode)
  return onSnapshot(coupleRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() })
    } else {
      callback(null)
    }
  })
}

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
  
  // Get the couple first to find all member IDs, then subscribe to each profile
  const coupleRef = doc(db, 'couples', coupleCode)
  let profileUnsubscribers = []
  
  const unsubscribeCouple = onSnapshot(coupleRef, (coupleDoc) => {
    // Unsubscribe from old profile listeners
    profileUnsubscribers.forEach(unsub => unsub())
    profileUnsubscribers = []
    
    if (!coupleDoc.exists()) {
      callback({})
      return
    }
    
    const memberIds = coupleDoc.data().members || []
    if (memberIds.length === 0) {
      callback({})
      return
    }
    
    // Subscribe to all member profiles
    const profiles = {}
    let loadedCount = 0
    
    memberIds.forEach(memberId => {
      const userRef = doc(db, 'userProfiles', memberId)
      const unsub = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists()) {
          profiles[memberId] = userDoc.data()
        }
        loadedCount++
        // Call callback once all profiles are loaded
        if (loadedCount >= memberIds.length) {
          callback({ ...profiles })
        }
      }, (err) => {
        console.error('Error subscribing to user profile:', memberId, err)
        loadedCount++
        if (loadedCount >= memberIds.length) {
          callback({ ...profiles })
        }
      })
      profileUnsubscribers.push(unsub)
    })
  })
  
  // Return cleanup function
  return () => {
    unsubscribeCouple()
    profileUnsubscribers.forEach(unsub => unsub())
  }
}

// Sticky Notes
export const subscribeStickyNotes = (coupleCode, callback) => {
  if (!coupleCode) return () => {}
  const q = query(collection(db, 'stickyNotes'), where('coupleCode', '==', coupleCode), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(notes)
  })
}

export const addStickyNote = async (coupleCode, note) => {
  await addDoc(collection(db, 'stickyNotes'), { ...note, coupleCode })
}

export const deleteStickyNote = async (id) => {
  await deleteDoc(doc(db, 'stickyNotes', id))
}

// Book Discussions
export const subscribeBookDiscussions = (bookId, callback) => {
  if (!bookId) return () => {}
  const q = query(collection(db, 'bookDiscussions'), where('bookId', '==', bookId), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const discussions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(discussions)
  })
}

export const addBookDiscussion = async (bookId, discussion) => {
  await addDoc(collection(db, 'bookDiscussions'), { ...discussion, bookId, createdAt: serverTimestamp() })
}

export const deleteBookDiscussion = async (id) => {
  await deleteDoc(doc(db, 'bookDiscussions', id))
}

// Reactions - generic function for gratitudes and sticky notes
export const toggleReaction = async (collection, itemId, userId, emoji) => {
  const docRef = doc(db, collection, itemId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) return
  
  const data = docSnap.data()
  const reactions = data.reactions || {}
  
  // If user already reacted with this emoji, remove it
  if (reactions[userId] === emoji) {
    const newReactions = { ...reactions }
    delete newReactions[userId]
    await updateDoc(docRef, { reactions: newReactions })
  } else {
    // Add or update user's reaction
    await updateDoc(docRef, {
      [`reactions.${userId}`]: emoji
    })
  }
}
