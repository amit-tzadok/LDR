import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Heart, Calendar } from 'lucide-react'
import { subscribeSpecialDates, addSpecialDate, updateSpecialDate, deleteSpecialDate } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

const categories = ['Anniversary', 'Birthday', 'First Date', 'Trip', 'Milestone', 'Other']

export default function SpecialDates() {
  const { coupleCode } = useCouple()
  const [dates, setDates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    category: 'Anniversary',
    notes: '',
  })

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeSpecialDates(coupleCode, setDates)
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateSpecialDate(editingId, formData)
      setEditingId(null)
    } else {
      await addSpecialDate(coupleCode, formData)
    }
    
    setFormData({ title: '', date: '', category: 'Anniversary', notes: '' })
    setShowForm(false)
  }

  const handleEdit = (dateItem) => {
    setFormData({
      title: dateItem.title,
      date: dateItem.date,
      category: dateItem.category,
      notes: dateItem.notes || '',
    })
    setEditingId(dateItem.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this special date?')) {
      await deleteSpecialDate(id)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Anniversary': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'Birthday': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'First Date': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      'Trip': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Milestone': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
    }
    return colors[category] || colors['Other']
  }

  const sortedDates = [...dates].sort((a, b) => new Date(a.date) - new Date(b.date))

  const getDaysUntil = (dateString) => {
    const now = new Date()
    const targetDate = new Date(dateString + 'T00:00:00')
    const diff = targetDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return `${Math.abs(days)} days ago`
    if (days === 0) return 'Today! 🎉'
    if (days === 1) return 'Tomorrow'
    return `In ${days} days`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Special Dates 📅</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your important moments together</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (showForm) {
              setEditingId(null)
              setFormData({ title: '', date: '', category: 'Anniversary', notes: '' })
            }
          }}
          className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Date'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-700 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              {editingId ? 'Edit Special Date' : 'Add Special Date'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  id="specialDateTitle"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                  placeholder="e.g., Our First Date"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  id="specialDateDate"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="specialDateCategory"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                id="specialDateNotes"
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
                placeholder="Add a special memory or note..."
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              {editingId ? 'Update Date' : 'Add Date'}
            </button>
          </form>
        </div>
      )}

      {/* Dates List */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="card text-center py-12 dark:bg-gray-800">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No special dates yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Click "Add Date" to create your first one!</p>
          </div>
        ) : (
          sortedDates.map((dateItem) => {
            const isPast = new Date(dateItem.date) < new Date()
            return (
              <div
                key={dateItem.id}
                className={`card dark:bg-gray-800 hover:shadow-lg transition-shadow ${
                  !isPast ? 'border-l-4 border-pink-400 dark:border-pink-600' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        {dateItem.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dateItem.category)}`}>
                        {dateItem.category}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-700 dark:text-gray-200 font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(dateItem.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>

                      <p className={`text-sm font-semibold ${
                        isPast 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-pink-600 dark:text-pink-400'
                      }`}>
                        {getDaysUntil(dateItem.date)}
                      </p>

                      {dateItem.notes && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 italic">
                          "{dateItem.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dateItem)}
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dateItem.id)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
