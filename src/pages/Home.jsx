import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, BookOpen, Tv, Plane, Sparkles, Calendar, UserPlus, Mail, Award, CheckCircle2 } from 'lucide-react'
import { getSettings, updateNextMeetDate } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

export default function Home() {
  const [nextMeetDate, setNextMeetDate] = useState('')
  const [countdown, setCountdown] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const navigate = useNavigate()
  const { coupleCode } = useCouple()

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getSettings(coupleCode, (settings) => {
      setNextMeetDate(settings.nextMeetDate || '')
    })
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!nextMeetDate) return

    const calculateCountdown = () => {
      const now = new Date()
      now.setHours(0, 0, 0, 0) // Reset time to start of day
      
      const meetDate = new Date(nextMeetDate + 'T00:00:00')
      const diff = meetDate - now

      if (diff <= 0) {
        setCountdown("We're together!")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 1) {
        setCountdown(`1 day until we're together!`)
      } else {
        setCountdown(`${days} days until we're together!`)
      }
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(interval)
  }, [nextMeetDate])

  const handleUpdateDate = async () => {
    if (!coupleCode) {
      console.error('No couple code available')
      setSaveMessage('Error: No couple code found. Please refresh the page.')
      setTimeout(() => setSaveMessage(''), 5000)
      return
    }
    
    if (!newDate) {
      setSaveMessage('Please select a date.')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }
    
    try {
      console.log('Updating date with coupleCode:', coupleCode, 'newDate:', newDate)
      await updateNextMeetDate(coupleCode, newDate)
      setShowDatePicker(false)
      setNewDate('')
      setSaveMessage('Date saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error updating date:', error)
      setSaveMessage('Failed to save date: ' + error.message)
      setTimeout(() => setSaveMessage(''), 5000)
    }
  }

  const navCards = [
    { 
      title: 'Date Ideas', 
      icon: Heart, 
      path: '/date-ideas',
      gradient: 'from-pink-300 to-pink-400',
      description: 'Things we want to do together'
    },
    { 
      title: 'By Location', 
      icon: MapPin, 
      path: '/date-ideas-by-location',
      gradient: 'from-green-300 to-emerald-400',
      description: 'Ideas sorted by place'
    },
    { 
      title: 'Books', 
      icon: BookOpen, 
      path: '/books',
      gradient: 'from-pink-200 to-green-300',
      description: 'Books to read together'
    },
    { 
      title: 'Shows', 
      icon: Tv, 
      path: '/shows',
      gradient: 'from-green-300 to-green-400',
      description: 'Shows to watch together'
    },
    { 
      title: 'Future Trips', 
      icon: Plane, 
      path: '/future-trips',
      gradient: 'from-pink-300 to-green-300',
      description: 'Trips we are planning'
    },
    { 
      title: 'Dream Trips', 
      icon: Sparkles, 
      path: '/dream-trips',
      gradient: 'from-green-200 to-pink-300',
      description: 'Our bucket list destinations'
    },
    { 
      title: 'Invite Partner', 
      icon: UserPlus, 
      path: '/invite',
      gradient: 'from-pink-300 to-pink-400',
      description: 'Share this app with your partner'
    },
    { 
      title: 'Special Dates', 
      icon: Calendar, 
      path: '/special-dates',
      gradient: 'from-green-300 to-pink-300',
      description: 'Our calendar of special moments'
    },
    { 
      title: 'Gratitude Wall', 
      icon: Sparkles, 
      path: '/gratitude',
      gradient: 'from-yellow-300 to-pink-400',
      description: 'Things we appreciate'
    },
    { 
      title: 'Milestones', 
      icon: Award, 
      path: '/milestones',
      gradient: 'from-purple-300 to-pink-400',
      description: 'Track our journey together'
    },
    { 
      title: 'Daily Habits', 
      icon: CheckCircle2, 
      path: '/daily-habits',
      gradient: 'from-green-300 to-emerald-400',
      description: 'Build habits together'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Countdown Section */}
      <div className="card text-center bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700 border-2 border-pink-200 dark:border-pink-500">
        <div className="flex justify-center mb-4">
          <Heart className="w-16 h-16 text-pink-500 fill-pink-500 animate-pulse" />
        </div>
        
        {nextMeetDate ? (
          <>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {countdown}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {new Date(nextMeetDate + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC'
              })}
            </p>
          </>
        ) : (
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Set when you'll see each other next</p>
        )}

        <button
          onClick={() => {
            setShowDatePicker(!showDatePicker)
            if (!showDatePicker && nextMeetDate) {
              setNewDate(nextMeetDate) // Pre-fill with current date
            }
          }}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          {nextMeetDate ? 'Update Date' : 'Set Date'}
        </button>

        {saveMessage && (
          <p className={`mt-3 text-sm font-medium ${saveMessage.includes('Failed') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {saveMessage}
          </p>
        )}

        {showDatePicker && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-xl">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="input mb-3"
            />
            <div className="flex gap-2">
              <button onClick={handleUpdateDate} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setShowDatePicker(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Cards - Grouped by Category */}
      <div className="space-y-8">
        {/* Our Relationship Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
            Our Relationship
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.filter(card => ['Milestones', 'Special Dates'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="nav-card text-left group"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Connection Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Daily Connection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.filter(card => ['Daily Habits', 'Gratitude Wall'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="nav-card text-left group"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Planning Together Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-pink-500" />
            Planning Together
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.filter(card => ['Date Ideas', 'By Location', 'Future Trips', 'Dream Trips'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="nav-card text-left group"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Shared Interests Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Shared Interests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.filter(card => ['Books', 'Shows'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="nav-card text-left group"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-green-500" />
            Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {navCards.filter(card => ['Invite Partner'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="nav-card text-left group"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
