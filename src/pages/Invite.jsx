import { useState, useEffect } from 'react'
import { Heart, Copy, Check, Mail, Link as LinkIcon, Key } from 'lucide-react'
import { useCouple } from '../contexts/CoupleContext'

export default function Invite() {
  const [copied, setCopied] = useState(false)
  const { coupleCode } = useCouple()
  const appUrl = window.location.origin + window.location.pathname
  const inviteMessage = `Hey! Join me on our LDR app! Use code: ${coupleCode || 'LOADING'}\n\nSign up here: ${appUrl}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(inviteMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailInvite = () => {
    const subject = encodeURIComponent('Join me on our LDR app!')
    const body = encodeURIComponent(inviteMessage)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Heart className="w-16 h-16 text-pink-400 fill-pink-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Invite Your Partner</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your couple code with your partner so they can join your private space!
        </p>
      </div>

      {/* Couple Code Card */}
      <div className="card bg-gradient-to-br from-pink-100 to-green-100 dark:from-pink-900/30 dark:to-green-900/30 border-2 border-pink-300 dark:border-pink-700">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-7 h-7 text-pink-600 dark:text-pink-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Couple Code</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 text-center border-2 border-pink-200 dark:border-pink-800">
          <p className="text-4xl font-bold font-mono tracking-wider text-pink-600 dark:text-pink-400">
            {coupleCode || 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(coupleCode || '')
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
          disabled={!coupleCode}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Invite Message Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold text-gray-800">Send Invite Message</h2>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">{inviteMessage}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyMessage}
            className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copy Message
          </button>
          <button
            onClick={handleEmailInvite}
            className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Email Invite
          </button>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700 border-2 border-pink-200 dark:border-pink-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">How it works:</h3>
        <ol className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex gap-2">
            <span className="font-semibold text-pink-500">1.</span>
            <span>Share your couple code (<span className="font-mono font-bold">{coupleCode}</span>) with your partner</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-green-500">2.</span>
            <span>They sign up at: {appUrl}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-pink-500">3.</span>
            <span>During signup, they select "Join my partner's couple" and enter your code</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-green-500">4.</span>
            <span>You'll both see the same shared content - completely private to just you two!</span>
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
              Only people with your couple code can join your space. Each couple has completely separate data. 
              Keep your code safe and only share it with your partner!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
