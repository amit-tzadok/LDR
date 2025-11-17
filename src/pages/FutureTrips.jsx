import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Plane } from 'lucide-react'
import { subscribeFutureTrips, addFutureTrip, updateFutureTrip, deleteFutureTrip } from '../services/firebase'

const priorities = ['Low', 'Medium', 'High']

export default function FutureTrips() {
  const [trips, setTrips] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterPriority, setFilterPriority] = useState('all')

  const [formData, setFormData] = useState({
    destination: '',
    priority: 'Medium',
    estimatedDate: '',
    notes: '',
  })

  useEffect(() => {
    const unsubscribe = subscribeFutureTrips(setTrips)
    return unsubscribe
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateFutureTrip(editingId, formData)
      setEditingId(null)
    } else {
      await addFutureTrip(formData)
    }

    setFormData({ destination: '', priority: 'Medium', estimatedDate: '', notes: '' })
    setShowForm(false)
  }

  const handleEdit = (trip) => {
    setFormData({
      destination: trip.destination,
      priority: trip.priority,
      estimatedDate: trip.estimatedDate || '',
      notes: trip.notes || '',
    })
    setEditingId(trip.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await deleteFutureTrip(id)
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (filterPriority === 'all') return true
    return trip.priority === filterPriority
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-700'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'High':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Future Trips ✈️</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ destination: '', priority: 'Medium', estimatedDate: '', notes: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Trip'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPriority('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filterPriority === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({trips.length})
        </button>
        {priorities.map(priority => (
          <button
            key={priority}
            onClick={() => setFilterPriority(priority)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterPriority === priority
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {priority} ({trips.filter(t => t.priority === priority).length})
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Edit Trip' : 'Plan New Trip'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="input"
              required
              placeholder="Where are we going?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input"
              required
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Date</label>
            <input
              type="date"
              value={formData.estimatedDate}
              onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Details, plans, or anything else..."
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Update Trip' : 'Add Trip'}
          </button>
        </form>
      )}

      {/* Trips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrips.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No future trips yet. Start planning your next adventure! 🗺️</p>
          </div>
        ) : (
          filteredTrips.map(trip => (
            <div key={trip.id} className="card hover:shadow-2xl transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <Plane className="w-8 h-8 text-pink-400" />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">{trip.destination}</h3>
              
              <div className="space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(trip.priority)}`}>
                  {trip.priority} Priority
                </span>

                {trip.estimatedDate && (
                  <p className="text-gray-600 text-sm">
                    📅 {new Date(trip.estimatedDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}

                {trip.notes && (
                  <p className="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-100">
                    {trip.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
