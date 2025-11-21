import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { updateUserProfile } from '../services/firebase'

export default function RecoverSpace() {
  const [loading, setLoading] = useState(true)
  const [recoverableCouples, setRecoverableCouples] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const findRecoverableCouples = async () => {
      if (!currentUser) return

      try {
        setLoading(true)
        
        // Get current user profile to see what couples they're supposedly in
        const userRef = doc(db, 'userProfiles', currentUser.uid)
        const userDoc = await getDoc(userRef)
        const currentCouples = userDoc.exists() ? (userDoc.data().couples || []) : []
        
        // Find all couples where this user is a member
        const couplesRef = collection(db, 'couples')
        const q = query(couplesRef, where('members', 'array-contains', currentUser.uid))
        const snapshot = await getDocs(q)
        
        const couples = []
        snapshot.forEach(doc => {
          const data = doc.data()
          couples.push({
            id: doc.id,
            ...data,
            isInProfile: currentCouples.includes(doc.id)
          })
        })
        
        setRecoverableCouples(couples)
      } catch (err) {
        console.error('Error finding couples:', err)
        setError('Failed to search for recoverable spaces: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    findRecoverableCouples()
  }, [currentUser])

  const handleRecover = async (coupleId) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Get current user profile
      const userRef = doc(db, 'userProfiles', currentUser.uid)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      const currentCouples = userData.couples || []
      
      // Add couple if not already there
      if (!currentCouples.includes(coupleId)) {
        await updateUserProfile(currentUser.uid, {
          couples: [...currentCouples, coupleId],
          activeCoupleCode: coupleId
        })
        
        setSuccess('Space recovered successfully!')
        
        // Update local state
        setRecoverableCouples(prev => 
          prev.map(c => c.id === coupleId ? { ...c, isInProfile: true } : c)
        )
        
        // Navigate to home after a delay
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      console.error('Error recovering couple:', err)
      setError('Failed to recover space: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && recoverableCouples.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-2xl text-pink-500 animate-pulse">Searching for recoverable spaces...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-pink-500" />
          Recover Spaces
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Find and restore spaces you're a member of
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-300">
          {success}
        </div>
      )}

      {recoverableCouples.length === 0 ? (
        <div className="card text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            No Recoverable Spaces Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn't find any spaces where you're a member that aren't already in your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recoverableCouples.map(couple => (
            <div 
              key={couple.id}
              className={`card ${couple.isInProfile ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {couple.customName || 'Space'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
                    Code: {couple.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Members: {couple.members?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Created: {couple.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </p>
                </div>
                <div>
                  {couple.isInProfile ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm font-semibold">
                      ✓ Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRecover(couple.id)}
                      disabled={loading}
                      className="btn-primary"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Recover
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
