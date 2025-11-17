import { useState, useEffect } from 'react'
import { Mail, Send, Trash2, Heart } from 'lucide-react'
import { getLetters, addLetter, deleteLetter } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'

export default function Mailbox() {
  const [letters, setLetters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newLetter, setNewLetter] = useState({ subject: '', message: '', frogSticker: '' })
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [error, setError] = useState(null)
  const { currentUser } = useAuth()
  const { coupleCode } = useCouple()

  const frogStickers = ['🐸', '🐊', '🦎', '🦖', '🪷', '💚', '🌿', '☘️']

  console.log('Mailbox - coupleCode:', coupleCode)

  useEffect(() => {
    console.log('Mailbox useEffect - coupleCode:', coupleCode)
    if (!coupleCode) return
    setError(null)
    const unsubscribe = getLetters(
      coupleCode, 
      (data) => {
        console.log('Received letters:', data)
        setLetters(data.sort((a, b) => b.createdAt - a.createdAt))
        setError(null)
      },
      (err) => {
        console.error('Mailbox error:', err)
        if (err.code === 'failed-precondition') {
          setError('Database index is being created. This may take a few minutes. Please refresh the page in a moment.')
        } else {
          setError('Failed to load letters: ' + err.message)
        }
      }
    )
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!coupleCode) {
      alert('Error: Couple code not loaded. Please refresh the page.')
      return
    }
    
    if (!newLetter.subject.trim() || !newLetter.message.trim()) {
      alert('Please fill in both subject and message.')
      return
    }
    
    try {
      console.log('Sending letter with coupleCode:', coupleCode)
      await addLetter(coupleCode, {
        ...newLetter,
        from: currentUser.email,
        read: false,
        createdAt: Date.now()
      })
      setNewLetter({ subject: '', message: '', frogSticker: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error sending letter:', error)
      alert('Failed to send letter: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this letter?')) {
      await deleteLetter(id)
      if (selectedLetter?.id === id) {
        setSelectedLetter(null)
      }
    }
  }

  const openLetter = (letter) => {
    setSelectedLetter(letter)
  }

  const closeLetter = () => {
    setSelectedLetter(null)
  }

  return (
    <div className="space-y-6">
      {!coupleCode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
            ⚠️ Couple code not loaded. Please refresh the page or check the Invite page for your couple code.
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200">
            ℹ️ {error}
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Mail className="w-8 h-8 text-pink-500" />
            Mailbox
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Love letters for each other</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
          disabled={!coupleCode}
        >
          <Send className="w-5 h-5" />
          Write Letter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            New Love Letter
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newLetter.subject}
                onChange={(e) => setNewLetter({ ...newLetter, subject: e.target.value })}
                className="input"
                placeholder="A little note for you..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={newLetter.message}
                onChange={(e) => setNewLetter({ ...newLetter, message: e.target.value })}
                className="input min-h-[200px] resize-y"
                placeholder="Write your heart out..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                Send Letter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setNewLetter({ subject: '', message: '', frogSticker: '' })
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {letters.length === 0 ? (
        <div className="card text-center py-12">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No letters yet</p>
          <p className="text-gray-400 mt-2">Write your first love letter!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {letters.map((letter) => (
            <div
              key={letter.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-2 border-pink-100 dark:border-pink-800"
              onClick={() => openLetter(letter)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className={`w-5 h-5 ${letter.from === currentUser.email ? 'text-green-500' : 'text-pink-500'}`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {letter.from === currentUser.email ? 'From: You' : `From: ${letter.from}`}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {new Date(letter.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {letter.frogSticker && (
                      <span className="text-lg ml-auto">{letter.frogSticker}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    {letter.subject}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                    {letter.message}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(letter.id)
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Letter Modal */}
      {selectedLetter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeLetter}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-green-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm opacity-90">
                      {selectedLetter.from === currentUser.email ? 'From: You' : `From: ${selectedLetter.from}`}
                    </span>
                    <span className="text-sm opacity-75">
                      {new Date(selectedLetter.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {selectedLetter.subject}
                    {selectedLetter.frogSticker && (
                      <span className="text-3xl">{selectedLetter.frogSticker}</span>
                    )}
                  </h2>
                </div>
                <button
                  onClick={closeLetter}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-pink max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedLetter.message}
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <button
                  onClick={() => {
                    handleDelete(selectedLetter.id)
                    closeLetter()
                  }}
                  className="text-red-500 hover:text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
