import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, BookOpen, Tv, Plane, Sparkles, Calendar, UserPlus, Mail, Award, CheckCircle2, StickyNote, Plus, X } from 'lucide-react'
import { getSettings, updateNextMeetDate, subscribeStickyNotes, addStickyNote, getAllUserProfiles } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'
import { useAuth } from '../contexts/AuthContext'

const noteColors = [
  { name: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-100', border: 'border-yellow-300' },
  { name: 'Pink', bg: 'bg-pink-100 dark:bg-pink-100', border: 'border-pink-300' },
  { name: 'Blue', bg: 'bg-blue-100 dark:bg-blue-100', border: 'border-blue-300' },
  { name: 'Green', bg: 'bg-green-100 dark:bg-green-100', border: 'border-green-300' },
]

export default function Home() {
  const [nextMeetDate, setNextMeetDate] = useState('')
  const [countdown, setCountdown] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [stickyNotes, setStickyNotes] = useState([])
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [selectedColor, setSelectedColor] = useState(noteColors[0])
  const [userProfiles, setUserProfiles] = useState({})
  const navigate = useNavigate()
  const { coupleCode } = useCouple()
  const { currentUser } = useAuth()

  // Check if this is a new user without a couple and show welcome modal
  useEffect(() => {
    if (!coupleCode && currentUser) {
      const hasSeenWelcome = sessionStorage.getItem(`hasSeenWelcome_${currentUser.uid}`)
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true)
        sessionStorage.setItem(`hasSeenWelcome_${currentUser.uid}`, 'true')
      }
    }
  }, [coupleCode, currentUser])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getSettings(coupleCode, (settings) => {
      setNextMeetDate(settings.nextMeetDate || '')
    })
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeStickyNotes(coupleCode, (notes) => {
      if (!currentUser) {
        setStickyNotes([])
        return
      }
      // sort by newest first, filter out notes created by the current user
      const sorted = [...notes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      const partnerNotes = sorted.filter(n => n.createdBy !== currentUser.uid)
      // keep only the latest partner note
      setStickyNotes(partnerNotes.slice(0, 1))
    })
    return unsubscribe
  }, [coupleCode, currentUser])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, setUserProfiles)
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

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (newNote.trim()) {
      await addStickyNote(coupleCode, {
        message: newNote,
        color: selectedColor.name,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        createdAt: Date.now()
      })
      setNewNote('')
      setShowNoteForm(false)
      setSelectedColor(noteColors[0])
    }
  }

  const getAuthorName = (note) => {
    const profile = userProfiles[note.createdBy]
    return profile?.name || note.createdByEmail || 'Unknown'
  }

  const getColorStyles = (colorName) => {
    return noteColors.find(c => c.name === colorName) || noteColors[0]
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
      title: 'Books', 
      icon: BookOpen, 
      path: '/books',
      gradient: 'from-pink-200 to-green-300',
      description: 'Books to read together'
    },
    { 
      title: 'Shows & Movies', 
      icon: Tv, 
      path: '/shows',
      gradient: 'from-green-300 to-green-400',
      description: 'Shows and movies to watch together'
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
    { 
      title: 'Sticky Notes', 
      icon: StickyNote, 
      path: '/sticky-notes',
      gradient: 'from-yellow-200 to-orange-300',
      description: 'Quick notes for your partner'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Sticky Notes Corner */}
      {stickyNotes.length > 0 && (
        <div className="fixed bottom-24 right-4 z-40 space-y-2" style={{ maxWidth: '200px' }}>
          {stickyNotes.map((note, index) => {
            const colorStyles = getColorStyles(note.color)
            return (
              <div
                key={note.id}
                className={`${colorStyles.bg} ${colorStyles.border} border-2 rounded-lg p-3 shadow-lg transform transition-transform hover:scale-105 cursor-pointer`}
                style={{ 
                  transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (index + 1) * 2}deg)`,
                }}
                onClick={() => navigate('/sticky-notes')}
              >
                <p className="text-xs leading-tight line-clamp-3 mb-2 font-medium text-black dark:text-gray-900">
                  {note.message}
                </p>
                <p className="text-xs opacity-80 italic flex items-center gap-1 font-medium text-black dark:text-gray-900">
                  <Heart className="w-3 h-3" />
                  {getAuthorName(note)}
                </p>
              </div>
            )
          })}
          <button
            onClick={() => setShowNoteForm(true)}
            className="w-full bg-yellow-200 border-2 border-yellow-300 text-gray-800 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      )}

      {/* Add first note button if no notes */}
      {stickyNotes.length === 0 && (
        <button
          onClick={() => setShowNoteForm(true)}
          className="fixed bottom-24 right-4 z-40 bg-yellow-200 border-2 border-yellow-300 text-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
        >
          <StickyNote className="w-5 h-5" />
          Add Note
        </button>
      )}

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <StickyNote className="w-6 h-6 text-pink-500" />
                New Sticky Note
              </h3>
              <button
                onClick={() => {
                  setShowNoteForm(false)
                  setNewNote('')
                  setSelectedColor(noteColors[0])
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Leave a sweet message..."
                  required
                  autoFocus
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newNote.length}/200 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2">
                  {noteColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-lg ${color.bg} ${
                        selectedColor.name === color.name 
                          ? 'border-4 border-gray-800 dark:border-gray-900 scale-110 ring-4 ring-pink-300 dark:ring-pink-500' 
                          : 'border-2 border-gray-300 dark:border-gray-600'
                      } transition-all hover:scale-105`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                Post Note
              </button>
            </form>
          </div>
        </div>
      )}

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
            {navCards.filter(card => ['Daily Habits', 'Gratitude Wall', 'Sticky Notes'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
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
            {navCards.filter(card => ['Date Ideas', 'Future Trips', 'Dream Trips'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
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
            {navCards.filter(card => ['Books', 'Shows & Movies'].includes(card.title)).map(({ title, icon: Icon, path, gradient, description }) => (
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

      {/* Welcome Modal for New Users */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Heart className="w-16 h-16 text-pink-400 fill-pink-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Welcome! 👋
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ready to create your shared space? Let's get you connected with your partner or friend!
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowWelcomeModal(false)
                  navigate('/invite')
                }}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 py-4"
              >
                <UserPlus className="w-5 h-5" />
                Set Up Your Space
              </button>
              
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="btn-secondary w-full py-4"
              >
                I'll do this later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
