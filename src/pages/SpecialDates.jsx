import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Calendar, Heart } from 'lucide-react'
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
    switch (category) {
      case 'Anniversary':
        return 'bg-pink-100 text-pink-700'
      case 'Birthday':
        return 'bg-purple-100 text-purple-700'
      case 'First Date':
        return 'bg-rose-100 text-rose-700'
      case 'Trip':
        return 'bg-green-100 text-green-700'
      case 'Milestone':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const sortedDates = [...dates].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA - dateB
  })

  const getDaysUntil = (dateString) => {
    const now = new Date()
    const targetDate = new Date(dateString + 'T00:00:00')
    const diff = targetDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) {
      return `${Math.abs(days)} days ago`
    } else if (days === 0) {
      return 'Today!'
    } else if (days === 1) {
      return 'Tomorrow!'
    } else {
      return `In ${days} days`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Special Dates 📅</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', date: '', category: 'Anniversary', notes: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Date'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {editingId ? 'Edit Special Date' : 'Add Special Date'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              placeholder="e.g., Our First Date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <textarea
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
      )}

      {/* Calendar View */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="card text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No special dates yet. Add your first one!</p>
          </div>
        ) : (
          sortedDates.map(dateItem => {
            const isPast = new Date(dateItem.date) < new Date()
            return (
              <div
                key={dateItem.id}
                className={`card ${isPast ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gradient-to-br from-pink-50 to-green-50 dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-700'}`}
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
                      <p className="text-gray-700 dark:text-gray-200 font-medium">
                        📅 {new Date(dateItem.date + 'T00:00:00').toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      
                      <p className={`text-sm font-medium ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-pink-600 dark:text-pink-400'}`}>
                        {getDaysUntil(dateItem.date)}
                      </p>

                      {dateItem.notes && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          {dateItem.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dateItem)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dateItem.id)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
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
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Calendar, Heart } from 'lucide-react'
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
              return (
              <div
                key={dateItem.id}
                className={`card ${isPast ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gradient-to-br from-pink-50 to-green-50 dark:bg-gray-800 border-2 border-pink-200 dark:border-pink-700'}`}>
        return 'bg-purple-100 text-purple-700'
      case 'First Date':
        return 'bg-rose-100 text-rose-700'
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">                                                                                      {dateItem.title}
        return 'bg-green-100 text-green-700'
      case 'Milestone':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
                      <p className="text-gray-700 dark:text-gray-200 font-medium">

  const sortedDates = [...dates].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA - dateB
  })

                      
                      <p className={`text-sm font-medium ${isPast ? 'text-gray-500 dark:text-gray-400' : 'text-pink-600 dark:text-pink-400'}`}>                                                       {getDaysUntil(dateItem.date)}
    const targetDate = new Date(dateString + 'T00:00:00')
    const diff = targetDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">                                                                  {dateItem.notes}
    if (days < 0) {
      return `${Math.abs(days)} days ago`
    } else if (days === 0) {
      return 'Today!'
    } else if (days === 1) {
      return 'Tomorrow!'
    } else {
      return `In ${days} days`
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"                          title="Edit"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"                            title="Delete"
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', date: '', category: 'Anniversary', notes: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Date'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Edit Special Date' : 'Add Special Date'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              placeholder="e.g., Our First Date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
              required
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
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
      )}

      {/* Calendar View */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="card text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No special dates yet. Add your first one!</p>
          </div>
        ) : (
          sortedDates.map(dateItem => {
            const isPast = new Date(dateItem.date) < new Date()
            return (
              <div
                key={dateItem.id}
                className={`card ${isPast ? 'bg-gray-50' : 'bg-gradient-to-br from-pink-50 to-green-50 border-2 border-pink-200'}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {dateItem.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dateItem.category)}`}>
                        {dateItem.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-700 font-medium">
                        📅 {new Date(dateItem.date + 'T00:00:00').toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      
                      <p className={`text-sm font-medium ${isPast ? 'text-gray-500' : 'text-pink-600'}`}>
                        {getDaysUntil(dateItem.date)}
                      </p>

                      {dateItem.notes && (
                        <p className="text-gray-600 text-sm mt-2 pt-2 border-t border-gray-200">
                          {dateItem.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dateItem)}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dateItem.id)}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
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
