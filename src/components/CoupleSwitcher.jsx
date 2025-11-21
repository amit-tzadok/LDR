import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCouple } from '../contexts/CoupleContext'
import { Users, ChevronDown, LogOut } from 'lucide-react'
import { getInitials } from '../utils/avatar'
import { getCouple, getAllUserProfiles } from '../services/firebase'

export default function CoupleSwitcher() {
  const navigate = useNavigate()
  const { coupleCode, coupleCodes, switchCouple, leaveCouple, hasMultipleCouples } = useCouple()
  const [isOpen, setIsOpen] = useState(false)
  const [couples, setCouples] = useState({})
  const [coupleProfiles, setCoupleProfiles] = useState({})
  const [loading, setLoading] = useState(false)

  // Load couple details and member names
  useEffect(() => {
    const unsubscribers = []
    
    const loadCouples = async () => {
      const coupleDetails = {}
      
      for (const code of coupleCodes) {
        try {
          const couple = await getCouple(code)
          coupleDetails[code] = couple
          
          // Load member profiles for this couple
          const unsubscribe = getAllUserProfiles(code, (profiles) => {
            setCoupleProfiles(prev => ({ ...prev, [code]: profiles }))
          })
          
          unsubscribers.push(unsubscribe)
        } catch (err) {
          console.error('Error loading couple:', code, err)
        }
      }
      setCouples(coupleDetails)
    }
    
    if (coupleCodes.length > 0) {
      loadCouples()
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub && unsub())
    }
  }, [coupleCodes])

  const handleSwitch = async (code) => {
    await switchCouple(code)
    setIsOpen(false)
  }

  const handleLeave = async (code, e) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to leave this space? You will lose access to all shared data.')) {
      return
    }
    
    setLoading(true)
    try {
      await leaveCouple(code)
      setIsOpen(false)
    } catch (err) {
      alert('Failed to leave couple: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCoupleDisplayName = (code) => {
    const couple = couples[code]
    
    // Use custom name if set
    if (couple?.customName) {
      return couple.customName
    }
    
    const profiles = coupleProfiles[code]
    if (!profiles || Object.keys(profiles).length === 0) {
      return 'My Space'
    }
    
    const names = Object.values(profiles)
      .map(p => p.name || 'User')
      .filter(Boolean)
      .slice(0, 3) // Show max 3 names
    
    if (names.length === 0 || names.length === 1) return 'My Space'
    if (names.length === 2) return `${names[0]} & ${names[1]}'s Space`
    return `${names[0]}, ${names[1]} & ${names[2]}'s Space`
  }

  if (coupleCodes.length === 0) {
    return null
  }

  const activeCoupleName = getCoupleDisplayName(coupleCode)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors max-w-xs"
      >
        <Users className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate">
          <span
            className="cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/space-settings')
            }}
          >
            {activeCoupleName}
          </span>
        </span>
        {hasMultipleCouples && <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>

      {isOpen && hasMultipleCouples && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                YOUR SPACES
              </div>
              {coupleCodes.map((code) => {
                const couple = couples[code]
                const isActive = code === coupleCode
                const members = couple?.members?.length || 1
                const displayName = getCoupleDisplayName(code)
                
                return (
                  <div
                    key={code}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => !isActive && handleSwitch(code)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Avatars: show up to 3 member avatars, fallback to icon */}
                          <div className="flex items-center -space-x-2 mr-2">
                            {(() => {
                              const profilesObj = coupleProfiles[code] || {}
                              const memberIds = couple?.members || Object.keys(profilesObj)
                              const avatars = memberIds.map(id => profilesObj[id] || (couple?.membersMeta?.[id] || { id }))
                              return avatars.slice(0, 3).map((p, i) => (
                                p?.photoURL ? (
                                  <img
                                    key={p.id || i}
                                    src={p.photoURL}
                                    alt={p.name || 'avatar'}
                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                                  />
                                ) : (
                                  <div key={p.id || i} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-pink-600 font-semibold">
                                    {getInitials(p) || (p.id ? String(p.id).slice(0,2).toUpperCase() : '')}
                                  </div>
                                )
                              ))
                            })()}
                          </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {displayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {members} {members === 1 ? 'member' : 'members'}
                        </div>
                      </div>
                    </div>
                    {!isActive && (
                      <button
                        onClick={(e) => handleLeave(code, e)}
                        disabled={loading}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-opacity"
                        title="Leave this space"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                    {isActive && (
                      <div className="text-xs font-semibold text-pink-600 dark:text-pink-400">
                        Active
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
