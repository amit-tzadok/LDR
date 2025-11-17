import { useState, useEffect } from 'react'
import { User, Save, Bell, BellOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeUserProfile, updateUserProfile, getAllUserProfiles } from '../services/firebase'
import { requestNotificationPermission } from '../utils/notifications'

export default function Profile() {
  const { currentUser } = useAuth()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userProfiles, setUserProfiles] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('default')
  const [notificationLoading, setNotificationLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = subscribeUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setName(profile.name || '')
      }
    })

    return unsubscribe
  }, [currentUser])

  useEffect(() => {
    const unsubscribe = getAllUserProfiles((profiles) => {
      setUserProfiles(profiles)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await updateUserProfile(currentUser.uid, {
        name: name.trim(),
        email: currentUser.email
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEnableNotifications = async () => {
    setNotificationLoading(true)
    try {
      const token = await requestNotificationPermission()
      if (token) {
        setNotificationStatus('granted')
        alert('Notifications enabled! 🔔')
      } else {
        alert('Failed to enable notifications. Please check your browser settings.')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      alert('Error enabling notifications. Please try again.')
    } finally {
      setNotificationLoading(false)
    }
  }

  const myProfile = userProfiles[currentUser?.uid]
  const partnerProfile = Object.values(userProfiles).find(
    profile => profile.email !== currentUser?.email
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <User className="w-8 h-8 text-pink-500" />
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your profile information
        </p>
      </div>

      {/* Current Info */}
      <div className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Your Information
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
            <p className="text-lg text-gray-800 dark:text-gray-100">{myProfile?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-lg text-gray-800 dark:text-gray-100">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Partner Info */}
      {partnerProfile && (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Your Partner
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
              <p className="text-lg text-gray-800 dark:text-gray-100">{partnerProfile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-lg text-gray-800 dark:text-gray-100">{partnerProfile.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Update Your Name
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter your name"
              required
            />
          </div>
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
              Profile updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Push Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {notificationStatus === 'granted' ? (
              <Bell className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                {notificationStatus === 'granted' 
                  ? '✓ Notifications are enabled'
                  : notificationStatus === 'denied'
                  ? 'Notifications are blocked. Please enable them in your browser settings.'
                  : 'Enable notifications to get updates from your partner'}
              </p>
            </div>
          </div>

          {notificationStatus !== 'granted' && notificationStatus !== 'denied' && (
            <button
              onClick={handleEnableNotifications}
              disabled={notificationLoading}
              className="btn-primary flex items-center gap-2"
            >
              <Bell className="w-5 h-5" />
              {notificationLoading ? 'Enabling...' : 'Enable Notifications'}
            </button>
          )}

          {notificationStatus === 'denied' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Notifications are blocked</p>
              <p>To enable them, go to your browser settings and allow notifications for this site.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
          💡 Tip
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Your name will be visible to your partner throughout the app, including in Daily Habits, 
          Letters, and other shared features.
        </p>
      </div>
    </div>
  )
}
