import { useState, useEffect } from 'react'
import { Plus, Trash2, StickyNote, Heart } from 'lucide-react'
import { subscribeStickyNotes, addStickyNote, deleteStickyNote, getAllUserProfiles } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'

const noteColors = [
  { name: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-100', border: 'border-yellow-300' },
  { name: 'Pink', bg: 'bg-pink-100 dark:bg-pink-100', border: 'border-pink-300' },
  { name: 'Blue', bg: 'bg-blue-100 dark:bg-blue-100', border: 'border-blue-300' },
  { name: 'Green', bg: 'bg-green-100 dark:bg-green-100', border: 'border-green-300' },
  { name: 'Purple', bg: 'bg-purple-100 dark:bg-purple-100', border: 'border-purple-300' },
  { name: 'Orange', bg: 'bg-orange-100 dark:bg-orange-100', border: 'border-orange-300' },
]

export default function StickyNotes() {
  const { coupleCode } = useCouple()
  const { currentUser } = useAuth()
  const [notes, setNotes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [selectedColor, setSelectedColor] = useState(noteColors[0])
  const [userProfiles, setUserProfiles] = useState({})

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeStickyNotes(coupleCode, setNotes)
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, setUserProfiles)
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
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
      setShowForm(false)
      setSelectedColor(noteColors[0])
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this note?')) {
      await deleteStickyNote(id)
    }
  }

  const getAuthorName = (note) => {
    const profile = userProfiles[note.createdBy]
    return profile?.name || note.createdByEmail || 'Unknown'
  }

  const getColorStyles = (colorName) => {
    return noteColors.find(c => c.name === colorName) || noteColors[0]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <StickyNote className="w-8 h-8 text-pink-500" />
            Sticky Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Quick notes for your partner 💌
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Write a Note
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="input"
              rows={4}
              placeholder="Leave a sweet message for your partner..."
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
            <div className="flex gap-2 flex-wrap">
              {noteColors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-lg ${color.bg} ${
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
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="card text-center py-12">
          <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No notes yet</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Leave your first sticky note for your partner! 📝</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => {
            const colorStyles = getColorStyles(note.color)
            return (
              <div
                key={note.id}
                className={`${colorStyles.bg} ${colorStyles.border} border-2 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all transform hover:-rotate-1 relative`}
                style={{ minHeight: '150px' }}
              >
                <button
                  onClick={() => handleDelete(note.id)}
                  className="absolute top-2 right-2 text-gray-700 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="pr-6">
                  <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words text-black dark:text-gray-900">
                    {note.message}
                  </p>
                </div>
                
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-xs opacity-80 italic flex items-center gap-1 text-black dark:text-gray-900 font-medium">
                    <Heart className="w-3 h-3" />
                    {getAuthorName(note)}
                  </p>
                  <p className="text-xs opacity-60 mt-1 text-black dark:text-gray-900">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
