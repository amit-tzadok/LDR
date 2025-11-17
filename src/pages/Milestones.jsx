import { useState, useEffect } from 'react'
import { Award, Plus, Edit2, Trash2, Calendar, Heart, Sparkles } from 'lucide-react'
import { getMilestones, addMilestone, updateMilestone, deleteMilestone, getSettings } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

export default function Milestones() {
  const [milestones, setMilestones] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [relationshipStart, setRelationshipStart] = useState('')
  const { coupleCode } = useCouple()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'First',
    frogSticker: ''
  })

  const frogStickers = ['', '🐸', '🐊', '🦎', '🦖', '🪷']

  const categories = ['First', 'Anniversary', 'Trip', 'Achievement', 'Other']

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getMilestones(coupleCode, (data) => {
      setMilestones(data)
    })
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getSettings(coupleCode, (settings) => {
      setRelationshipStart(settings.relationshipStart || '')
    })
    return unsubscribe
  }, [coupleCode])

  const calculateTimeTogether = () => {
    if (!relationshipStart) return null
    
    const start = new Date(relationshipStart)
    const now = new Date()
    const diffTime = Math.abs(now - start)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    const days = diffDays % 30

    return { years, months, days, totalDays: diffDays }
  }

  const timeTogether = calculateTimeTogether()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await updateMilestone(editingId, formData)
      setEditingId(null)
    } else {
      await addMilestone(coupleCode, {
        ...formData,
        createdAt: Date.now()
      })
    }
    setFormData({ title: '', description: '', date: '', category: 'First' })
    setShowForm(false)
  }

  const handleEdit = (milestone) => {
    setFormData({
      title: milestone.title,
      description: milestone.description,
      date: milestone.date,
      category: milestone.category,
      frogSticker: milestone.frogSticker || ''
    })
    setEditingId(milestone.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this milestone?')) {
      await deleteMilestone(id)
    }
  }

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Anniversary': return <Heart className="w-5 h-5" />
      case 'Trip': return <Sparkles className="w-5 h-5" />
      case 'Achievement': return <Award className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Anniversary': return 'from-pink-400 to-pink-500'
      case 'Trip': return 'from-green-400 to-emerald-500'
      case 'Achievement': return 'from-yellow-400 to-orange-500'
      case 'First': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Award className="w-8 h-8 text-pink-500" />
            Milestones
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Track your relationship journey</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', description: '', date: '', category: 'First', frogSticker: '' })
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Milestone
        </button>
      </div>

      {/* Time Together Counter */}
      {timeTogether && (
        <div className="card bg-gradient-to-br from-pink-500 to-green-500 text-white">
          <h2 className="text-2xl font-bold mb-4 text-center">Together For</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-4xl font-bold">{timeTogether.years}</div>
              <div className="text-sm opacity-90">Years</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{timeTogether.months}</div>
              <div className="text-sm opacity-90">Months</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{timeTogether.days}</div>
              <div className="text-sm opacity-90">Days</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm opacity-90">
            {timeTogether.totalDays.toLocaleString()} days total
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {editingId ? 'Edit Milestone' : 'New Milestone'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="Our first date"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Tell the story..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frog Sticker (optional)
              </label>
              <div className="flex gap-2 flex-wrap">
                {frogStickers.map((sticker, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, frogSticker: sticker })}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.frogSticker === sticker
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 scale-110'
                        : 'border-gray-200 dark:border-gray-600 hover:border-pink-300'
                    }`}
                  >
                    <span className="text-2xl">{sticker || '∅'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({ title: '', description: '', date: '', category: 'First' })
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {milestones.length === 0 ? (
        <div className="card text-center py-12">
          <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No milestones yet</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Start tracking your special moments!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="card hover:shadow-lg dark:hover:shadow-pink-500/10 transition-shadow">
                <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getCategoryColor(milestone.category)} flex items-center justify-center text-white flex-shrink-0 relative`}>
                  {getCategoryIcon(milestone.category)}
                  {milestone.frogSticker && (
                    <span className="absolute -top-1 -right-1 text-lg">{milestone.frogSticker}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        {milestone.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(milestone.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                          {milestone.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(milestone)}
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(milestone.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {milestone.description && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
