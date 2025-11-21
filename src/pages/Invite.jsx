import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Copy, Check, Mail, Link as LinkIcon, Key, UserPlus, Users, LogOut } from 'lucide-react'
import { useCouple } from '../contexts/CoupleContext'
import { useAuth } from '../contexts/AuthContext'
import { createCouple, joinCouple, getCouple } from '../services/firebase'

export default function Invite() {
  const [copied, setCopied] = useState(false)
  const [copiedTrio, setCopiedTrio] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pairInviteCode, setPairInviteCode] = useState('')
  const [trioInviteCode, setTrioInviteCode] = useState('')
  const [memberCount, setMemberCount] = useState(1)
  const [joinInviteCode, setJoinInviteCode] = useState('')
  const [relationshipType, setRelationshipType] = useState('romantic') // 'romantic' or 'platonic'
  const { coupleCode, coupleCodes, userProfile, hasCouple, refreshCoupleCode, leaveCouple, switchCouple } = useCouple()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  // Use full URL with base path for GitHub Pages
  const appUrl = `${window.location.origin}${import.meta.env.BASE_URL || '/'}`
  const pairInviteLink = pairInviteCode ? `${appUrl}?invite=${pairInviteCode}` : ''
  const trioInviteLink = trioInviteCode ? `${appUrl}?invite=${trioInviteCode}` : ''
  
  const relationshipLabel = relationshipType === 'romantic' ? 'partner' : 'friend'
  

  // Check for invite code in URL on mount
  useEffect(() => {
    try {
      // mark that the user visited the invite page so we don't force-redirect
      // returning users to /invite on subsequent visits
      localStorage.setItem('seenInvite', '1')
    } catch (err) {
      // ignore localStorage errors (e.g. SSR or restricted environments)
    }
    const params = new URLSearchParams(window.location.search)
    const urlInviteCode = params.get('invite')
    if (urlInviteCode) {
      setJoinInviteCode(urlInviteCode)
    }
  }, [])

  // Subscribe to couple data for real-time member count updates
  useEffect(() => {
    if (!hasCouple || !coupleCode) {
      setMemberCount(1)
      return
    }

    const loadAndSubscribe = async () => {
      try {
        const { subscribeCouple } = await import('../services/firebase')
        const unsubscribe = subscribeCouple(coupleCode, (couple) => {
          if (couple) {
            setMemberCount(couple.members?.length || 1)
          }
        })
        return unsubscribe
      } catch (err) {
        console.error('Error subscribing to couple:', err)
      }
    }

    const unsubscribePromise = loadAndSubscribe()
    return () => {
      unsubscribePromise.then(unsub => unsub && unsub())
    }
  }, [hasCouple, coupleCode])

  // Auto-load invite codes when user has a couple
  useEffect(() => {
    const loadInviteCodes = async () => {
      if (hasCouple && coupleCode) {
        setLoading(true)
        try {
          const couple = await getCouple(coupleCode)
          // Don't set memberCount here anymore - it's handled by subscription above
          
          if (couple?.pairInviteCode && couple?.trioInviteCode) {
            // Has both new codes
            setPairInviteCode(couple.pairInviteCode)
            setTrioInviteCode(couple.trioInviteCode)
          } else if (couple?.inviteCode) {
            // Old couple with single invite code - use it as pairInviteCode
            setPairInviteCode(couple.inviteCode)
            // Generate trioInviteCode
            const newTrioCode = Math.random().toString(36).substring(2, 15).toLowerCase()
            setTrioInviteCode(newTrioCode)
            
            const { doc, updateDoc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            const coupleRef = doc(db, 'couples', coupleCode)
            await updateDoc(coupleRef, { 
              pairInviteCode: couple.inviteCode,
              trioInviteCode: newTrioCode 
            })
          } else {
            // Generate both codes for old couples
            const newPairCode = Math.random().toString(36).substring(2, 15).toLowerCase()
            const newTrioCode = Math.random().toString(36).substring(2, 15).toLowerCase()
            setPairInviteCode(newPairCode)
            setTrioInviteCode(newTrioCode)
            
            const { doc, updateDoc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            const coupleRef = doc(db, 'couples', coupleCode)
            await updateDoc(coupleRef, { 
              inviteCode: newPairCode,
              pairInviteCode: newPairCode,
              trioInviteCode: newTrioCode 
            })
            console.log('Auto-generated invite codes')
          }
        } catch (err) {
          console.error('Error loading invite codes:', err)
        } finally {
          setLoading(false)
        }
      }
    }
    
    loadInviteCodes()
  }, [hasCouple, coupleCode])

  // Auto-join if user is logged in, has no couple, and has invite code
  useEffect(() => {
    const autoJoin = async () => {
      // Only auto-join if:
      // 1. User is logged in
      // 2. User has no couple
      // 3. There's an invite code from URL
      // 4. Not already loading
      // 5. No error yet
      if (currentUser && !hasCouple && joinInviteCode && !loading && !error) {
        console.log('Auto-joining couple with invite code:', joinInviteCode)
        setLoading(true)
        setError('')
        
        try {
          const coupleCode = await joinCouple(joinInviteCode, currentUser.uid)
          console.log('Auto-join successful:', coupleCode)
          await refreshCoupleCode()
          
          // Wait for context to update
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Clear the URL parameter
          window.history.replaceState({}, '', window.location.pathname)
          
          // Navigate to home
          navigate('/')
        } catch (err) {
          console.error('Auto-join error:', err)
          setError(err.message || 'Failed to join couple')
        } finally {
          setLoading(false)
        }
      }
    }
    
    autoJoin()
  }, [currentUser, hasCouple, joinInviteCode, loading, error, navigate, refreshCoupleCode])

  // Log state for debugging
  console.log('Invite page state:', { hasCouple, coupleCode, joinInviteCode })

  const handleCreateCouple = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await createCouple(currentUser.uid, currentUser.email)
      console.log('Couple created successfully:', result)
      
      // Switch to the new couple
      await switchCouple(result.coupleCode)
      
      // Load the new couple's invite codes
      setPairInviteCode(result.pairInviteCode)
      setTrioInviteCode(result.trioInviteCode)
      setMemberCount(1)
      
      await refreshCoupleCode()
      // Don't redirect - let user see and copy their invite code
    } catch (err) {
      console.error('Error creating couple:', err)
      setError(err.message || 'Failed to create couple')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCouple = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('Attempting to join couple with invite code:', joinInviteCode)
      const coupleCode = await joinCouple(joinInviteCode, currentUser.uid)
      console.log('Successfully joined couple:', coupleCode)
      await refreshCoupleCode()
      setJoinInviteCode('')
      // After joining couple, redirect to home
      setTimeout(() => navigate('/'), 1000)
    } catch (err) {
      console.error('Error joining couple:', err)
      setError(err.message || 'Failed to join couple')
    } finally {
      setLoading(false)
    }
  }

  

  // If user doesn't have a couple yet, show setup screen
  if (!hasCouple) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-pink-400 fill-pink-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome to Your Shared Space</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create a space to share with your partner or friend
          </p>
        </div>

        {error && (
          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Relationship Type Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">What type of relationship is this?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRelationshipType('romantic')}
              className={`p-4 rounded-xl border-2 transition-all ${
                relationshipType === 'romantic'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
              }`}
            >
              <div className="text-4xl mb-2">💕</div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">Romantic</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">For couples</div>
            </button>
            <button
              onClick={() => setRelationshipType('platonic')}
              className={`p-4 rounded-xl border-2 transition-all ${
                relationshipType === 'platonic'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
              }`}
            >
              <div className="text-4xl mb-2">🤝</div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">Platonic</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">For friends</div>
            </button>
          </div>
        </div>

        {/* Create Couple */}
        <div className="card bg-gradient-to-br from-pink-100 to-green-100 dark:from-pink-900/30 dark:to-green-900/30 border-2 border-pink-300 dark:border-pink-700">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-7 h-7 text-pink-600 dark:text-pink-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create a Shared Space</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Start a new private space for you and your {relationshipLabel}. You'll get an invite code to share with them.
          </p>
          <button
            onClick={handleCreateCouple}
            disabled={loading}
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Shared Space'}
          </button>
        </div>

        {/* Join Couple */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Join {relationshipType === 'romantic' ? "Partner's" : "Friend's"} Space</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Have an invite code from your {relationshipLabel}? Enter it below to join their space.
          </p>
          <form onSubmit={handleJoinCouple} className="space-y-3">
            <input
              id="joinInviteCode"
              name="joinInviteCode"
              type="text"
              value={joinInviteCode}
              onChange={(e) => setJoinInviteCode(e.target.value.toLowerCase())}
              placeholder="Enter invite code"
              className="input w-full font-mono text-center text-lg"
              required
              autoComplete="one-time-code"
            />
            <button
              type="submit"
              disabled={loading || !joinInviteCode}
              className="btn-primary w-full"
            >
              {loading ? 'Joining...' : 'Join Shared Space'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // If user has a couple, show invite screen
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Heart className="w-16 h-16 text-pink-400 fill-pink-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Invite Someone</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your invite code so they can join your private space!
        </p>
      </div>

      {/* Debug panel removed */}

      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Join Option for Users Who Created a Couple */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Have an Invite Code Instead?</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          If someone already created a space and sent you their code, you can join theirs instead.
        </p>
        <form onSubmit={handleJoinCouple} className="space-y-3">
          <input
            id="joinInviteCodeAlt"
            name="joinInviteCode"
            type="text"
            value={joinInviteCode}
            onChange={(e) => setJoinInviteCode(e.target.value.toLowerCase())}
            placeholder="Enter their invite code"
            className="input w-full font-mono text-center text-lg"
            autoComplete="one-time-code"
          />
          <button
            type="submit"
            disabled={loading || !joinInviteCode}
            className="btn-primary w-full"
          >
            {loading ? 'Joining...' : 'Join Their Space'}
          </button>
        </form>
      </div>

      {/* Leave Space Option */}
      <div className="card bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700">
        <div className="flex items-center gap-3 mb-4">
          <LogOut className="w-7 h-7 text-red-600 dark:text-red-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Leave This Space</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Want to leave this space? You'll lose access to all shared data in this space.
        </p>
        <button
          onClick={async () => {
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
              // Navigate to home - will redirect to invite if no couples remain
              navigate('/invite')
            } catch (err) {
              setError('Failed to leave space: ' + err.message)
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          className="btn-secondary w-full inline-flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
        >
          <LogOut className="w-5 h-5" />
          {loading ? 'Leaving...' : 'Leave Space'}
        </button>
      </div>

      {/* Create Another Space Option */}
      <div className="card bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create Another Space</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Want to create a separate space with a different {relationshipLabel}? You can have multiple spaces!
        </p>
        <button
          onClick={handleCreateCouple}
          disabled={loading}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          {loading ? 'Creating...' : 'Create New Space'}
        </button>
      </div>

      {/* Invite Code Cards */}
      {pairInviteCode && (
        <>
          {/* Pair Invite Code (for 2nd person) */}
          {memberCount < 2 && (
            <div className="card bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 border-2 border-pink-300 dark:border-pink-700">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-7 h-7 text-pink-600 dark:text-pink-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Invite Code for Your {relationshipType === 'romantic' ? 'Partner' : 'Friend'}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share this code with someone to join as your pair (2 people total)
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 text-center border-2 border-pink-200 dark:border-pink-800">
                <p className="text-4xl font-bold font-mono tracking-wider text-pink-600 dark:text-pink-400">
                  {pairInviteCode}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pairInviteCode)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Pair Code
                  </>
                )}
              </button>
              <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Share Link:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all mb-3">{pairInviteLink}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pairInviteLink)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Trio Invite Code (for 3rd person) */}
          {memberCount >= 2 && memberCount < 3 && trioInviteCode && (
            <div className="card bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 border-2 border-green-300 dark:border-green-700">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Invite Code for Third Person
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share this code to add a third member to your space (3 people total - maximum)
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 text-center border-2 border-green-200 dark:border-green-800">
                <p className="text-4xl font-bold font-mono tracking-wider text-green-600 dark:text-green-400">
                  {trioInviteCode}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trioInviteCode)
                  setCopiedTrio(true)
                  setTimeout(() => setCopiedTrio(false), 2000)
                }}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                {copiedTrio ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Trio Code
                  </>
                )}
              </button>
              <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Share Link:</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all mb-3">{trioInviteLink}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(trioInviteLink)
                    setCopiedTrio(true)
                    setTimeout(() => setCopiedTrio(false), 2000)
                  }}
                  className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-sm"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Space Full Message */}
          {memberCount >= 3 && (
            <div className="card bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Space Full
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your space has reached the maximum of 3 members. No more invites can be accepted.
                </p>
              </div>
            </div>
          )}

          {/* Instructions Card */}
          <div className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700 border-2 border-pink-200 dark:border-pink-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">How it works:</h3>
            <ol className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex gap-2">
                <span className="font-semibold text-pink-500">1.</span>
                <span>Share the appropriate invite code (pair or trio)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-500">2.</span>
                <span>They create an account at {appUrl}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-pink-500">3.</span>
                <span>They enter your invite code to join your space</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-green-500">4.</span>
                <span>You'll all see the same shared content - completely private to your group (max 3 people)!</span>
              </li>
            </ol>
          </div>

          {/* Security Note */}
          <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <div className="text-blue-600 dark:text-blue-400">🔒</div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Your Data is Private</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Only people with your invite codes can join your space. Each space has completely separate data. 
                  Keep your codes safe and only share them with people you want to connect with! Maximum 3 members per space.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
