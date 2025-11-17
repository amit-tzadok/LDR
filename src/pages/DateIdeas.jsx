import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X, Filter } from 'lucide-react'
import { subscribeDateIdeas, addDateIdea, updateDateIdea, deleteDateIdea } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'

const categories = ['Romantic', 'Movie Night', 'Games', 'Cute', 'Adventure', 'Food', 'Other']

export default function DateIdeas() {
  const [ideas, setIdeas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const { currentUser } = useAuth()
  const { coupleCode } = useCouple()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Romantic',
    location: '',
  })

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeDateIdeas(coupleCode, setIdeas)
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const ideaData = {
      ...formData,
      addedBy: currentUser.email,
    }

    if (editingId) {
      await updateDateIdea(editingId, formData)
      setEditingId(null)
    } else {
      await addDateIdea(coupleCode, ideaData)
    }

    setFormData({ title: '', description: '', category: 'Romantic', location: '' })
    setShowForm(false)
  }

  const handleEdit = (idea) => {
    setFormData({
      title: idea.title,
      description: idea.description || '',
      category: idea.category,
      location: idea.location || '',
    })
    setEditingId(idea.id)
    setShowForm(true)
  }

  const handleToggleComplete = async (idea) => {
    await updateDateIdea(idea.id, { completed: !idea.completed })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      await deleteDateIdea(id)
    }
  }

  const filteredIdeas = ideas.filter(idea => {
    if (filterCategory !== 'all' && idea.category !== filterCategory) return false
    if (!showCompleted && idea.completed) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Date Ideas</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', description: '', category: 'Romantic', location: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Idea'}
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-600" />
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterCategory === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
          />
          Show completed ideas
        </label>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Edit Idea' : 'New Date Idea'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              placeholder="What do you want to do?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Add more details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              placeholder="Where? (optional)"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Update Idea' : 'Add Idea'}
          </button>
        </form>
      )}

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No date ideas yet. Add your first one!</p>
          </div>
        ) : (
          filteredIdeas.map(idea => (
            <div
              key={idea.id}
              className={`card ${idea.completed ? 'bg-gray-50 opacity-75' : ''}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-semibold ${idea.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {idea.title}
                    </h3>
                    <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                      {idea.category}
                    </span>
                  </div>
                  {idea.description && (
                    <p className="text-gray-600 text-sm mb-2">{idea.description}</p>
                  )}
                  {idea.location && (
                    <p className="text-gray-500 text-sm">📍 {idea.location}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Added by {idea.addedBy}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleComplete(idea)}
                    className={`p-2 rounded-full transition-colors ${
                      idea.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900'
                    }`}
                    title={idea.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(idea)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(idea.id)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
