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
import { storage } from '../firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

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
    // membersMeta stores minimal public metadata for members to avoid cross-profile reads
    membersMeta: {},
    createdAt: serverTimestamp(),
    createdBy: userId
  }
  
  // Try to seed membersMeta with existing user profile data
  try {
    const userRef = doc(db, 'userProfiles', userId)
    const userDoc = await getDoc(userRef)
    if (userDoc.exists()) {
      const ud = userDoc.data()
      coupleData.membersMeta[userId] = {
        id: userId,
        name: ud.name || null,
        email: ud.email || userEmail || null,
        photoURL: ud.photoURL || null
      }
    } else {
      coupleData.membersMeta[userId] = { id: userId, email: userEmail || null }
    }
  } catch (err) {
    // If reading profile fails, still create couple with minimal meta
    console.debug('createCouple: failed to read user profile', err)
    coupleData.membersMeta[userId] = { id: userId, email: userEmail || null }
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
  
  // Add user to couple members array
  await updateDoc(doc(db, 'couples', coupleCode), {
    members: [...coupleData.members, userId]
  })

  // Also add minimal membersMeta entry to the couple document (merge)
  try {
    const userRef = doc(db, 'userProfiles', userId)
    const userDoc = await getDoc(userRef)
    const meta = userDoc.exists()
      ? { id: userId, name: userDoc.data().name || null, email: userDoc.data().email || null, photoURL: userDoc.data().photoURL || null }
      : { id: userId }
    await updateDoc(doc(db, 'couples', coupleCode), {
      [`membersMeta.${userId}`]: meta
    })
  } catch (err) {
    // Non-fatal - if profile read fails, skip adding meta
    console.debug('Could not add membersMeta for user:', userId, err)
  }
  
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

// Propagate profile name/email changes into couples.membersMeta so other
// members who cannot read `userProfiles` (due to rules) still see up-to-date
// display info. This is safe to run after updating the profile.
export const updateUserProfileAndPropagate = async (userId, updates) => {
  const profileRef = doc(db, 'userProfiles', userId)
  await setDoc(profileRef, {
    ...updates,
    updatedAt: serverTimestamp()
  }, { merge: true })

  try {
    const profileSnap = await getDoc(profileRef)
    const couplesList = profileSnap.exists() ? (profileSnap.data().couples || []) : []
    for (const coupleCode of couplesList) {
      const coupleRef = doc(db, 'couples', coupleCode)
      const metaUpdates = {}
      if ('name' in updates) metaUpdates[`membersMeta.${userId}.name`] = updates.name || null
      if ('email' in updates) metaUpdates[`membersMeta.${userId}.email`] = updates.email || null
      if (Object.keys(metaUpdates).length > 0) {
        await updateDoc(coupleRef, metaUpdates)
      }
    }
  } catch (err) {
    console.debug('updateUserProfileAndPropagate: failed to propagate to couples.membersMeta', err)
  }
}

// Backfill membersMeta for a couple by reading each member's userProfiles
export const backfillCoupleMembersMeta = async (coupleCode) => {
  if (!coupleCode) throw new Error('No coupleCode provided')
  const coupleRef = doc(db, 'couples', coupleCode)
  const coupleSnap = await getDoc(coupleRef)
  if (!coupleSnap.exists()) throw new Error('Couple not found')

  const memberIds = coupleSnap.data().members || []
  const updates = {}

  for (const memberId of memberIds) {
    try {
      const profileRef = doc(db, 'userProfiles', memberId)
      const profileSnap = await getDoc(profileRef)
      if (profileSnap.exists()) {
        const p = profileSnap.data()
        updates[`membersMeta.${memberId}`] = {
          id: memberId,
          name: p.name || null,
          email: p.email || null,
          photoURL: p.photoURL || null
        }
      } else {
        // If profile missing, leave placeholder id only
        updates[`membersMeta.${memberId}`] = { id: memberId }
      }
    } catch (err) {
      // On permission errors, try to keep existing membersMeta or set id
      console.debug('backfillCoupleMembersMeta: could not read profile for', memberId, err)
      updates[`membersMeta.${memberId}`] = { id: memberId }
    }
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(coupleRef, updates)
  }
}

// Avatar upload & management
export const uploadUserAvatar = (file, userId, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'))
    const filename = `${Date.now()}_${file.name}`
    const path = `avatars/${userId}/${filename}`
    const ref = storageRef(storage, path)
    const uploadTask = uploadBytesResumable(ref, file)

    uploadTask.on('state_changed', (snapshot) => {
      if (onProgress && typeof onProgress === 'function') {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress(percent)
      }
    }, (err) => {
      reject(err)
    }, async () => {
      try {
        const url = await getDownloadURL(uploadTask.snapshot.ref)

        // Update user profile with photoURL
        await updateUserProfile(userId, { photoURL: url })

        // Also update any couple documents where this user is present in membersMeta
        try {
          const profileRef = doc(db, 'userProfiles', userId)
          const profileSnap = await getDoc(profileRef)
          const couplesList = profileSnap.exists() ? (profileSnap.data().couples || []) : []
          // Update each couple's membersMeta entry (merge)
          for (const coupleCode of couplesList) {
            await updateDoc(doc(db, 'couples', coupleCode), {
              [`membersMeta.${userId}.photoURL`]: url
            })
          }
        } catch (err) {
          console.debug('uploadUserAvatar: failed to update couples membersMeta', err)
        }

        resolve(url)
      } catch (err) {
        reject(err)
      }
    })
  })
}

export const deleteUserAvatar = async (userId) => {
  // Try to find avatar objects under avatars/{userId}/ and delete them
  // Note: Firebase Storage SDK doesn't list by prefix in browser SDK without additional permissions.
  // We'll instead clear the photoURL in the profile and attempt to delete the previous object if the URL contains the storage bucket path.
  const profileRef = doc(db, 'userProfiles', userId)
  const profileSnap = await getDoc(profileRef)
  const photoURL = profileSnap.exists() ? profileSnap.data().photoURL : null
  if (photoURL) {
    try {
      // Try to derive full path from download URL - only works for default bucket URLs
      const match = photoURL.match(/\/b\/(.*?)\/o\/(.*?)\?alt=media/)
      if (match) {
        const fullPath = decodeURIComponent(match[2])
        const fileRef = storageRef(storage, fullPath)
        await deleteObject(fileRef)
      }
    } catch (err) {
      // Non-fatal if deletion fails
      console.debug('deleteUserAvatar: could not delete file from storage', err)
    }
  }

  // Clear photoURL in profile
  await updateUserProfile(userId, { photoURL: null })

  // Also clear membersMeta for couples
  try {
    const couplesList = profileSnap.exists() ? (profileSnap.data().couples || []) : []
    for (const coupleCode of couplesList) {
      await updateDoc(doc(db, 'couples', coupleCode), {
        [`membersMeta.${userId}.photoURL`]: null
      })
    }
  } catch (err) {
    console.debug('deleteUserAvatar: failed to update couples membersMeta', err)
  }
}

// Set user's photoURL and propagate to couples.membersMeta
export const setUserPhotoURL = async (userId, url) => {
  // Update profile
  await updateUserProfile(userId, { photoURL: url })

  // Also update any couple documents where this user is present in membersMeta
  try {
    const profileRef = doc(db, 'userProfiles', userId)
    const profileSnap = await getDoc(profileRef)
    const couplesList = profileSnap.exists() ? (profileSnap.data().couples || []) : []
    for (const coupleCode of couplesList) {
      await updateDoc(doc(db, 'couples', coupleCode), {
        [`membersMeta.${userId}.photoURL`]: url
      })
    }
  } catch (err) {
    console.debug('setUserPhotoURL: failed to update couples membersMeta', err)
  }
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
    const membersMeta = coupleDoc.data().membersMeta || {}
    if (memberIds.length === 0) {
      callback({})
      return
    }
    
    // Subscribe to all member profiles
    const profiles = {}
    let loadedCount = 0
    
    memberIds.forEach(memberId => {
      // If membersMeta is present, pre-seed the profile to avoid needing a full userProfiles read
      if (membersMeta[memberId]) {
        profiles[memberId] = membersMeta[memberId]
      }
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
        // If permission errors occur (e.g. Firestore rules), prefer membersMeta if available
        if (err?.code === 'permission-denied' || err?.message?.toLowerCase?.().includes('permission')) {
          if (membersMeta[memberId]) {
            profiles[memberId] = membersMeta[memberId]
            console.debug('Permission denied subscribing to user profile, using membersMeta for:', memberId)
          } else {
            profiles[memberId] = { id: memberId }
            console.debug('Permission denied subscribing to user profile, using placeholder for:', memberId)
          }
          loadedCount++
        } else {
          console.error('Error subscribing to user profile:', memberId, err)
          loadedCount++
        }

        if (loadedCount >= memberIds.length) {
          const result = { ...profiles }
          memberIds.forEach(id => {
            if (!result[id]) result[id] = (membersMeta[id] || { id })
          })
          callback(result)
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
