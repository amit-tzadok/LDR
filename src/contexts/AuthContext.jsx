import { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { auth } from '../firebase'
import { createUserProfile } from '../services/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email, password, name = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Create user profile immediately after signup
    await createUserProfile(userCredential.user.uid, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name: name || '',
      coupleCode: null,
      createdAt: new Date()
    })
    
    return userCredential
  }

  const signOut = () => {
    return firebaseSignOut(auth)
  }

  const value = {
    currentUser,
    signIn,
    signUp,
    signOut,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
