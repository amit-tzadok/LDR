import { useState, useEffect } from 'react'
import { Heart, Plus, Trash2, Sparkles, Smile } from 'lucide-react'
import { getGratitudes, addGratitude, deleteGratitude, getAllUserProfiles, toggleReaction } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'

export default function Gratitude() {
  const [gratitudes, setGratitudes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newGratitude, setNewGratitude] = useState('')
  const [userProfiles, setUserProfiles] = useState({})
  const [showReactionPicker, setShowReactionPicker] = useState(null)
  const { currentUser } = useAuth()
  const { coupleCode } = useCouple()

  const reactionEmojis = ['❤️', '🥰', '😳', '😂', '😛', '🥳', '🍅']

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getGratitudes(coupleCode, (data) => {
      setGratitudes(data.sort((a, b) => b.createdAt - a.createdAt))
    })
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, (profiles) => {
      setUserProfiles(profiles)
    })
    return unsubscribe
  }, [coupleCode])

  const getPartnerName = () => {
    const partnerProfile = Object.values(userProfiles).find(
      profile => profile.email !== currentUser.email
    )
    return partnerProfile?.name || 'Partner'
  }

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

  const handleReaction = async (itemId, emoji) => {
    await toggleReaction('gratitudes', itemId, currentUser.uid, emoji)
    setShowReactionPicker(null)
  }

  const getReactionCounts = (reactions = {}) => {
    const counts = {}
    Object.values(reactions).forEach(emoji => {
      counts[emoji] = (counts[emoji] || 0) + 1
    })
    return counts
  }

  const getRandomColor = (index) => {
    const colors = [
      'from-pink-200/20 to-pink-300/20 dark:from-pink-900/40 dark:to-pink-800/40 border-pink-300 dark:border-pink-700',
      'from-green-200/20 to-green-300/20 dark:from-green-900/40 dark:to-green-800/40 border-green-300 dark:border-green-700',
      'from-pink-200/20 to-green-200/20 dark:from-pink-900/40 dark:to-green-900/40 border-pink-300 dark:border-green-700',
      'from-emerald-200/20 to-pink-200/20 dark:from-emerald-900/40 dark:to-pink-900/40 border-emerald-300 dark:border-pink-700',
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
          {gratitudes.map((item, index) => {
            const colorClass = getRandomColor(index)
            
            return (
              <div
                key={item.id}
                className={`card bg-gradient-to-br ${colorClass} border-2 hover:shadow-lg transition-all hover:-translate-y-1 relative`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart 
                      className={`w-5 h-5 ${item.from === currentUser.email ? 'text-green-500 fill-green-500' : 'text-pink-500 fill-pink-500'}`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.from === currentUser.email ? 'You' : getPartnerName()}
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
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-10">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                
                {/* Reactions and Add Button - Bottom Right Corner */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {/* Reaction Counts */}
                  {Object.keys(getReactionCounts(item.reactions)).length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {Object.entries(getReactionCounts(item.reactions)).map(([emoji]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(item.id, emoji)}
                          className={`text-sm px-2 py-1 rounded-full border transition-all ${
                            item.reactions?.[currentUser.uid] === emoji
                              ? 'bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700 scale-110 font-semibold'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:scale-105'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Reaction Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReactionPicker(showReactionPicker === item.id ? null : item.id)}
                      className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full p-1.5 transition-all hover:scale-110 shadow-md"
                      title="Add reaction"
                    >
                      <Smile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    {showReactionPicker === item.id && (
                      <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-300 dark:border-gray-700 p-2 flex gap-1.5 z-10">
                        {reactionEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(item.id, emoji)}
                            className="text-lg hover:scale-125 transition-transform p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
