import { useState, useEffect } from 'react'
import { Heart, Plus, Trash2, Sparkles } from 'lucide-react'
import { getGratitudes, addGratitude, deleteGratitude } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'

export default function Gratitude() {
  const [gratitudes, setGratitudes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newGratitude, setNewGratitude] = useState('')
  const { currentUser } = useAuth()
  const { coupleCode } = useCouple()

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getGratitudes(coupleCode, (data) => {
      setGratitudes(data.sort((a, b) => b.createdAt - a.createdAt))
    })
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newGratitude.trim()) {
      await addGratitude(coupleCode, {
        message: newGratitude,
        from: currentUser.email,
        createdAt: Date.now()
      })
      setNewGratitude('')
      setShowForm(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this gratitude post?')) {
      await deleteGratitude(id)
    }
  }

  const getRandomColor = (index) => {
    const colors = [
      'from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30',
      'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
      'from-pink-100 to-green-100 dark:from-pink-900/30 dark:to-green-900/30',
      'from-emerald-100 to-pink-100 dark:from-emerald-900/30 dark:to-pink-900/30',
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-500" />
            Gratitude Wall
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Things we appreciate about each other</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Gratitude
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            What are you grateful for today?
          </h3>
          <div className="space-y-4">
            <textarea
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              className="input min-h-[120px] resize-y"
              placeholder="I'm grateful for..."
              required
              autoFocus
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setNewGratitude('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {gratitudes.length === 0 ? (
        <div className="card text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No gratitude posts yet</p>
          <p className="text-gray-400 mt-2">Start appreciating each other!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gratitudes.map((item, index) => (
            <div
              key={item.id}
              className={`card bg-gradient-to-br ${getRandomColor(index)} border-2 border-opacity-50 dark:border-opacity-30 hover:shadow-lg transition-all hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart 
                    className={`w-5 h-5 ${item.from === currentUser.email ? 'text-green-500 fill-green-500' : 'text-pink-500 fill-pink-500'}`}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.from === currentUser.email ? 'You' : 'Partner'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-gray-800 dark:text-gray-100 mb-3 leading-relaxed">
                {item.message}
              </p>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
