import { useState } from 'react'
import { Heart, Copy, Check, Mail, Link as LinkIcon } from 'lucide-react'

export default function Invite() {
  const [copied, setCopied] = useState(false)
  const appUrl = window.location.origin
  const inviteMessage = `Hey! Join me on our LDR app so we can plan our future together! Sign up here: ${appUrl}`

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Invite Your Partner</h1>
        <p className="text-gray-600">
          Share this app with your partner so you can start planning your future together!
        </p>
      </div>

      {/* App Link Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-800">Share App Link</h2>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 font-mono break-all">{appUrl}</p>
        </div>
        <button
          onClick={handleCopyLink}
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
              Copy Link
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
      <div className="card bg-gradient-to-br from-pink-50 to-green-50 border-2 border-pink-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">How it works:</h3>
        <ol className="space-y-2 text-gray-700">
          <li className="flex gap-2">
            <span className="font-semibold text-pink-500">1.</span>
            <span>Share the link or message with your partner</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-green-500">2.</span>
            <span>They create their own account (or use the same one)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-pink-500">3.</span>
            <span>You both can now see and edit all shared content!</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-green-500">4.</span>
            <span>Start planning your amazing future together!</span>
          </li>
        </ol>
      </div>

      {/* Security Note */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <div className="text-blue-600">🔒</div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Privacy & Security</h4>
            <p className="text-sm text-gray-600">
              Only users who create accounts can access your shared data. 
              Make sure to only share this link with your partner!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
