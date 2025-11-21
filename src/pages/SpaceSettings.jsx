import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Edit2, LogOut, Users } from 'lucide-react'
import { getInitials } from '../utils/avatar'
import { useCouple } from '../contexts/CoupleContext'
import { getCouple, getAllUserProfiles } from '../services/firebase'

export default function SpaceSettings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customName, setCustomName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [memberCount, setMemberCount] = useState(1)
  const [memberProfiles, setMemberProfiles] = useState({})
  const { coupleCode, leaveCouple } = useCouple()
  const navigate = useNavigate()

  // Load couple data
  useEffect(() => {
    const loadCoupleData = async () => {
      if (!coupleCode) return
      
      try {
        const couple = await getCouple(coupleCode)
        setCustomName(couple?.customName || '')
        setMemberCount(couple?.members?.length || 1)
      } catch (err) {
        console.error('Error loading couple:', err)
      }
    }
    
    loadCoupleData()
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, (profiles) => {
      setMemberProfiles(profiles)
    })
    return unsubscribe
  }, [coupleCode])

  const handleSaveCustomName = async () => {
    if (!coupleCode) return
    
    setLoading(true)
    setError('')
    
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('../firebase')
      
      const coupleRef = doc(db, 'couples', coupleCode)
      await updateDoc(coupleRef, {
        customName: customName.trim() || null
      })
      
      setIsEditingName(false)
      
      // Reload the page to refresh the space name everywhere
      window.location.reload()
    } catch (err) {
      console.error('Error updating custom name:', err)
      setError('Failed to update space name: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveSpace = async () => {
    const message = memberCount <= 2 
      ? 'Are you sure you want to leave this space? This space will be DELETED and all members will lose access to all shared data (dates, notes, milestones, etc.). This cannot be undone.'
      : 'Are you sure you want to leave this space? You will lose access to all shared data in this space. This cannot be undone.'
    
    if (!confirm(message)) {
      return
    }
    
    setLoading(true)
    try {
      await leaveCouple(coupleCode)
      // Wait a moment for the context to update
      await new Promise(resolve => setTimeout(resolve, 500))
      // Navigate to invite - will redirect if no couples remain
      navigate('/invite')
    } catch (err) {
      setError('Failed to leave space: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <Settings className="w-8 h-8 text-purple-500" />
          Space Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your shared space</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Customize Space Name */}
      <div className="card bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border-2 border-purple-300 dark:border-purple-700">
        <div className="flex items-center gap-3 mb-4">
          <Edit2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Space Name</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Give your space a custom name (e.g., "Our Adventure", "Best Friends Forever")
        </p>
        {isEditingName ? (
          <div className="space-y-3">
            <input
              id="spaceCustomName"
              name="customName"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter custom name (optional)"
              maxLength={50}
              className="input w-full"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveCustomName}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Saving...' : 'Save Name'}
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false)
                  // Reset to original name
                  getCouple(coupleCode).then(couple => setCustomName(couple?.customName || ''))
                }}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {customName || '(Using default name)'}
              </p>
            </div>
            <button
              onClick={() => setIsEditingName(true)}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              {customName ? 'Change Name' : 'Set Custom Name'}
            </button>
          </div>
        )}
      </div>

      {/* Space Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Space Info</h2>
        </div>
        <div className="space-y-3">
          <div className="py-2">
            <span className="text-gray-700 dark:text-gray-300">Members</span>
            <div className="flex items-center gap-3 mt-2">
              {Object.values(memberProfiles).length === 0 ? (
                <div className="text-sm text-gray-500">{memberCount} {memberCount === 1 ? 'member' : 'members'}</div>
              ) : (
                Object.values(memberProfiles).map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {p.photoURL ? (
                        <img src={p.photoURL} alt={p.name || 'avatar'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-pink-600 font-semibold text-xs">
                          {getInitials(p) || <Users className="w-4 h-4 text-pink-500" />}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{p.name || p.email || 'Member'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 dark:text-gray-300">Space Code</span>
            <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
              {coupleCode}
            </span>
          </div>
        </div>
      </div>

      {/* Leave Space */}
      <div className="card bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700">
        <div className="flex items-center gap-3 mb-4">
          <LogOut className="w-7 h-7 text-red-600 dark:text-red-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Danger Zone</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Leave this space and lose access to all shared data.
        </p>
        <button
          onClick={handleLeaveSpace}
          disabled={loading}
          className="btn-secondary w-full inline-flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
        >
          <LogOut className="w-5 h-5" />
          {loading ? 'Leaving...' : 'Leave This Space'}
        </button>
      </div>
    </div>
  )
}
