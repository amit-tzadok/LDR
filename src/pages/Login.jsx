import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { joinCouple } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { refreshCoupleCode, hasCouple } = useCouple()
  const navigate = useNavigate()

  // Check for invite code in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlInviteCode = params.get('invite')
    if (urlInviteCode) {
      setInviteCode(urlInviteCode.toLowerCase())
      setIsSignUp(true)
      setIsJoining(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name')
          setLoading(false)
          return
        }
        
        console.log('Signing up user...')
        const userCredential = await signUp(email, password, name.trim())
        const userId = userCredential.user.uid
        console.log('User signed up:', userId)
        
        if (isJoining && inviteCode.trim()) {
          // Join existing couple with invite code
          console.log('Attempting to join couple with invite code:', inviteCode.trim())
          await joinCouple(inviteCode.trim(), userId)
          console.log('Successfully joined couple')
          
          // Wait for the couple context to update by polling
          console.log('Waiting for couple context to update...')
          let attempts = 0
          const maxAttempts = 20 // 10 seconds max
          
          while (attempts < maxAttempts) {
            await refreshCoupleCode()
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Check if couple code was updated by re-reading from storage
            const { getUserCoupleCode } = await import('../services/coupleService')
            const currentCoupleCode = await getUserCoupleCode(userId)
            
            if (currentCoupleCode) {
              console.log('Couple context updated successfully:', currentCoupleCode)
              break
            }
            
            attempts++
            console.log(`Waiting for couple context... attempt ${attempts}/${maxAttempts}`)
          }
          
          if (attempts >= maxAttempts) {
            console.warn('Couple context did not update in time, but continuing anyway')
          }
        }
        // Don't auto-create couple - let them do it on the invite page
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      console.error('Login/Signup error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-green-500 bg-clip-text text-transparent">
            LDR App
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Our shared space to plan our future together</p>
        </div>

        {inviteCode && isSignUp && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✨ You're joining via invite code: <span className="font-mono font-bold">{inviteCode}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                  placeholder="Your name"
                />
              </div>
              
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Couple Setup</h3>
                </div>
                <div className="space-y-2 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isJoining}
                      onChange={() => setIsJoining(false)}
                      className="text-pink-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Start new couple (I'll invite my partner)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isJoining}
                      onChange={() => setIsJoining(true)}
                      className="text-pink-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Join my partner's space (I have an invite code)</span>
                  </label>
                </div>
                
                {isJoining && (
                  <div>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                      className="input text-center font-mono text-lg"
                      placeholder="Enter invite code"
                      required
                    />
                  </div>
                )}
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-pink-600 hover:text-pink-700 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  )
}
