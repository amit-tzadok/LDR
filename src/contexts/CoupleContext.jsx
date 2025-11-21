/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUserCoupleCode } from '../services/coupleService'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const CoupleContext = createContext()

export function useCouple() {
  return useContext(CoupleContext)
}

export function CoupleProvider({ children }) {
  const [coupleCode, setCoupleCode] = useState(null) // Active couple code
  const [coupleCodes, setCoupleCodes] = useState([]) // Array of all couple codes user is in
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const { currentUser } = useAuth()

  const refreshCoupleCode = async () => {
    if (currentUser) {
      try {
        console.log('Refreshing couple code for user:', currentUser.uid)
        const code = await getUserCoupleCode(currentUser.uid)
        console.log('Couple code refreshed:', code)
        setCoupleCode(code)
      } catch (error) {
        console.error('Error refreshing couple code:', error)
      }
    }
  }

  // Switch to a different couple
  const switchCouple = async (newCoupleCode) => {
    if (!coupleCodes.includes(newCoupleCode)) {
      console.error('User is not a member of couple:', newCoupleCode)
      return
    }
    
    console.log('Switching to couple:', newCoupleCode)
    setCoupleCode(newCoupleCode)
    
    // Save active couple to user profile
    const { updateUserProfile } = await import('../services/firebase')
    await updateUserProfile(currentUser.uid, { activeCoupleCode: newCoupleCode })
  }

  // Leave a specific couple
  const leaveCouple = async (coupleCodeToLeave) => {
    if (!currentUser) return
    
    try {
      console.log('Leaving couple:', coupleCodeToLeave)
      
      const { doc, getDoc, updateDoc, arrayRemove, deleteField } = await import('firebase/firestore')
      const { db } = await import('../firebase')
      
      // Remove user from couple members array
      const coupleRef = doc(db, 'couples', coupleCodeToLeave)
      await updateDoc(coupleRef, {
        members: arrayRemove(currentUser.uid),
        // remove the membersMeta entry for this user
        [`membersMeta.${currentUser.uid}`]: deleteField()
      })
      
      console.log('Removed from couple members')
      
      // Update user profile - remove from couples array
      const userRef = doc(db, 'userProfiles', currentUser.uid)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const updatedCouples = (userData.couples || []).filter(code => code !== coupleCodeToLeave)
        
        await updateDoc(userRef, {
          couples: updatedCouples,
          // If leaving active couple, switch to first remaining or null
          activeCoupleCode: coupleCodeToLeave === coupleCode 
            ? (updatedCouples[0] || null) 
            : userData.activeCoupleCode,
          // Remove old single coupleCode field if it matches
          ...(userData.coupleCode === coupleCodeToLeave ? { coupleCode: null } : {})
        })
        
        console.log('Updated user profile - removed couple:', coupleCodeToLeave)
        console.log('Remaining couples:', updatedCouples.length)
      }
      
      console.log('Successfully left couple:', coupleCodeToLeave)
    } catch (error) {
      console.error('Error leaving couple:', error)
      throw error
    }
  }

  // Subscribe to user profile to get real-time coupleCode updates
  useEffect(() => {
    if (!currentUser) {
      setUserProfile(null)
      setCoupleCode(null)
      setCoupleCodes([])
      setLoading(false)
      return
    }

    const userRef = doc(db, 'userProfiles', currentUser.uid)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const profile = { id: doc.id, ...doc.data() }
        console.log('User profile updated:', profile)
        setUserProfile(profile)
        
        // Support both old single couple and new multi-couple system
        const couples = profile.couples || (profile.coupleCode ? [profile.coupleCode] : [])
        setCoupleCodes(couples)
        
        // Use activeCoupleCode if set, otherwise use first couple or old coupleCode
        const activeCouple = profile.activeCoupleCode || couples[0] || profile.coupleCode || null
        setCoupleCode(activeCouple)
      } else {
        setUserProfile(null)
        setCoupleCode(null)
        setCoupleCodes([])
      }
      setLoading(false)
    }, (error) => {
      console.error('Error subscribing to user profile:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [currentUser])

  // Cleanup effect: Remove references to couples that no longer exist or user is not a member of
  // Only run once on mount to avoid aggressive cleanup
   
  useEffect(() => {
    let hasRun = false
    
    const cleanupInvalidCouples = async () => {
      if (!currentUser || coupleCodes.length === 0 || hasRun) return
      hasRun = true
      
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../firebase')
      const { updateUserProfile } = await import('../services/firebase')
      
      const validCouples = []
      
      for (const code of coupleCodes) {
        try {
          const coupleRef = doc(db, 'couples', code)
          const coupleDoc = await getDoc(coupleRef)
          
          // Keep couple if it exists and user is still a member
          if (coupleDoc.exists() && coupleDoc.data().members?.includes(currentUser.uid)) {
            validCouples.push(code)
          } else {
            console.log('Removing invalid couple from profile:', code)
          }
        } catch (err) {
          console.error('Error checking couple:', code, err)
          // If there's an error, keep the couple (don't remove it)
          validCouples.push(code)
        }
      }
      
      // Update profile if any couples were removed
      if (validCouples.length !== coupleCodes.length) {
        const userRef = doc(db, 'userProfiles', currentUser.uid)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          await updateUserProfile(currentUser.uid, {
            couples: validCouples,
            activeCoupleCode: validCouples.includes(userData.activeCoupleCode) 
              ? userData.activeCoupleCode 
              : (validCouples[0] || null),
            ...(userData.coupleCode && !validCouples.includes(userData.coupleCode) ? { coupleCode: null } : {})
          })
        }
      }
    }
    
    // Add delay to ensure data is loaded first
    const timeout = setTimeout(() => {
      cleanupInvalidCouples()
    }, 2000)
    
    return () => clearTimeout(timeout)
  }, [currentUser])

  const value = {
    coupleCode, // Active couple code
    coupleCodes, // Array of all couple codes
    setCoupleCode,
    switchCouple,
    leaveCouple,
    refreshCoupleCode,
    loading,
    userProfile,
    hasCouple: !!coupleCode,
    hasMultipleCouples: coupleCodes.length > 1
  }

  return (
    <CoupleContext.Provider value={value}>
      {children}
    </CoupleContext.Provider>
  )
}
