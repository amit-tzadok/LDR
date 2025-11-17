import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Heart, Users } from 'lucide-react'
import { createCouple, joinCouple } from '../services/coupleService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [coupleCode, setCoupleCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

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
        
        const userCredential = await signUp(email, password)
        const userId = userCredential.user.uid
        
        if (isJoining) {
          // Join existing couple with code
          if (!coupleCode.trim()) {
            setError('Please enter a couple code')
            setLoading(false)
            return
          }
          await joinCouple(userId, name.trim(), email, coupleCode.trim())
        } else {
          // Create new couple
          await createCouple(userId, name.trim(), email)
        }
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-pink-500 fill-pink-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-green-500 bg-clip-text text-transparent">
            LDR App
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Our shared space to plan our future together</p>
        </div>

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
                    <span className="text-sm text-gray-700 dark:text-gray-300">Join my partner's couple (I have a code)</span>
                  </label>
                </div>
                
                {isJoining && (
                  <div>
                    <input
                      type="text"
                      value={coupleCode}
                      onChange={(e) => setCoupleCode(e.target.value.toUpperCase())}
                      className="input text-center font-mono text-lg"
                      placeholder="Enter couple code"
                      required
                      maxLength={8}
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
