import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Tv, Film, Star } from 'lucide-react'
import { subscribeShows, addShow, updateShow, deleteShow } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

const statuses = ['Not Started', 'Watching', 'Finished']
const types = ['Show', 'Movie']
const platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Other']

export default function Shows() {
  const [shows, setShows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const { coupleCode } = useCouple()

  const [formData, setFormData] = useState({
    title: '',
    type: 'Show',
    platform: 'Netflix',
    status: 'Not Started',
    notes: '',
    rating: 0,
  })

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeShows(coupleCode, setShows)
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateShow(editingId, formData)
      setEditingId(null)
    } else {
      await addShow(coupleCode, formData)
    }

    setFormData({ title: '', type: 'Show', platform: 'Netflix', status: 'Not Started', notes: '', rating: 0 })
    setShowForm(false)
  }

  const handleEdit = (show) => {
    setFormData({
      title: show.title,
      type: show.type || 'Show',
      platform: show.platform,
      status: show.status,
      notes: show.notes || '',
      rating: show.rating || 0,
    })
    setEditingId(show.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this show?')) {
      await deleteShow(id)
    }
  }

  const filteredShows = shows.filter(show => {
    if (filterStatus !== 'all' && show.status !== filterStatus) return false
    if (filterType !== 'all' && (show.type || 'Show') !== filterType) return false
    return true
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      case 'Watching':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      case 'Finished':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Shows & Movies 🎬</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', type: 'Show', platform: 'Netflix', status: 'Not Started', notes: '', rating: 0 })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Title'}
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Types
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Status ({shows.length})
          </button>
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status} ({shows.filter(s => s.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {editingId ? 'Edit' : 'Add New Title'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
            <input
              id="showTitle"
              name="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              placeholder="Show or movie title"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
            <select
              id="showType"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input"
              required
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform *</label>
            <select
              id="showPlatform"
              name="platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="input"
              required
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
            <select
              id="showStatus"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
              required
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating (optional)</label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: 0 })}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <textarea
              id="showNotes"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Your thoughts..."
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Update' : 'Add'}
          </button>
        </form>
      )}

      {/* Shows List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShows.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No shows or movies yet. Add your first one! 🍿</p>
          </div>
        ) : (
          filteredShows.map(show => (
            <div key={show.id} className="card hover:shadow-2xl transition-shadow">
              <div className="flex justify-between items-start mb-3">
                {(show.type || 'Show') === 'Movie' ? <Film className="w-8 h-8 text-purple-400" /> : <Tv className="w-8 h-8 text-green-400" />}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(show)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(show.id)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                {show.title}
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  (show.type || 'Show') === 'Movie'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                  {(show.type || 'Show') === 'Movie' ? <Film className="w-3 h-3 inline mr-1" /> : <Tv className="w-3 h-3 inline mr-1" />}
                  {show.type || 'Show'}
                </span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{show.platform}</p>
              
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(show.status)}`}>
                  {show.status}
                </span>
                
                {show.rating > 0 && (
                  <div className="flex items-center gap-1">
                    {[...Array(show.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>

              {show.notes && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  {show.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
