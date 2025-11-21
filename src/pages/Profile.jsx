import { useState, useEffect } from 'react'
import { User, Save, Bell, BellOff, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeUserProfile, updateUserProfileAndPropagate, getAllUserProfiles, setUserPhotoURL, backfillCoupleMembersMeta } from '../services/firebase'
import { requestNotificationPermission } from '../utils/notifications'
import { useCouple } from '../contexts/CoupleContext'
import { deleteUser } from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function Profile() {
  const { currentUser } = useAuth()
  const { coupleCode } = useCouple()
  const [name, setName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [pasteUrl, setPasteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [userProfiles, setUserProfiles] = useState({})
  const [notificationStatus, setNotificationStatus] = useState('default')
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  

  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = subscribeUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setName(profile.name || '')
        setAvatarPreview(profile.photoURL || null)
      }
    })

    return unsubscribe
  }, [currentUser])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, (profiles) => {
      setUserProfiles(profiles)
    })
    return unsubscribe
  }, [coupleCode])

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
      // Update profile and propagate into couples.membersMeta
      await updateUserProfileAndPropagate(currentUser.uid, {
        name: name.trim(),
        email: currentUser.email
      })

      // Also backfill the active couple's membersMeta so partners immediately
      // see the updated info (safe no-op if no active couple)
      if (coupleCode) {
        try {
          await backfillCoupleMembersMeta(coupleCode)
        } catch (err) {
          // Non-fatal: log and continue
          console.debug('Profile save: backfill failed', err)
        }
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePropagate = async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      // Use existing name/email to propagate to couples.membersMeta
      await updateUserProfileAndPropagate(currentUser.uid, {
        name: name.trim(),
        email: currentUser.email
      })
      alert('Profile propagated to your spaces')
    } catch (err) {
      console.error('Propagation failed:', err)
      alert('Failed to propagate profile to spaces')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncSpace = async () => {
    if (!coupleCode) return alert('No active space to sync')
    setLoading(true)
    try {
      await backfillCoupleMembersMeta(coupleCode)
      alert('Space profiles synced')
    } catch (err) {
      console.error('Sync failed:', err)
      alert('Failed to sync space profiles: ' + (err.message || 'unknown error'))
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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      const userId = currentUser.uid
      
      // Delete user profile from Firestore
      await deleteDoc(doc(db, 'userProfiles', userId))
      
      // Delete Firebase Auth account (this will trigger logout automatically)
      await deleteUser(currentUser)
      
      // Force navigate to login after deletion
      window.location.href = '#/login'
    } catch (error) {
      console.error('Error deleting account:', error)
      if (error.code === 'auth/requires-recent-login') {
        alert('For security, please log out and log back in before deleting your account.')
      } else {
        alert('Failed to delete account. Please try again.')
      }
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
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
      <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Avatar</label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-pink-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paste image URL</label>
                  <div className="flex gap-2">
                    <input
                      id="avatarUrl"
                      name="avatarUrl"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={pasteUrl}
                      onChange={(e) => setPasteUrl(e.target.value)}
                      className="input flex-1"
                      autoComplete="off"
                    />
                    <button
                      onClick={async () => {
                        if (!pasteUrl) return alert('Please paste a valid image URL')
                        if (!currentUser) return alert('Not signed in')
                        setLoading(true)
                        try {
                          await setUserPhotoURL(currentUser.uid, pasteUrl)
                          setAvatarPreview(pasteUrl)
                          setPasteUrl('')
                          // Also backfill the active couple so partners see the updated avatar immediately
                          if (coupleCode) {
                            try {
                              await backfillCoupleMembersMeta(coupleCode)
                            } catch (err) {
                              console.debug('Post-avatar backfill failed', err)
                            }
                          }
                          alert('Avatar set from URL')
                        } catch (err) {
                          console.error('Failed to set avatar URL:', err)
                          alert('Failed to set avatar URL')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="btn-primary px-3"
                      type="button"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
            <p className="text-lg text-gray-800 dark:text-gray-100">{myProfile?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-lg text-gray-800 dark:text-gray-100">{currentUser?.email}</p>
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
              <p className="text-lg text-gray-800 dark:text-gray-100">{partnerProfile?.name || partnerProfile?.email || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-lg text-gray-800 dark:text-gray-100">{partnerProfile?.email || 'Not set'}</p>
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
              id="displayName"
              name="displayName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter your name"
              required
              autoComplete="name"
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
            {loading ? 'Saving...' : 'Save & Sync'}
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

      {/* Delete Account */}
      <div className="card border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Delete Account
        </h2>
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete My Account
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-300 dark:border-red-700">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-3">
                ⚠️ Are you sure? This will permanently delete your account and all data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete Forever'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
