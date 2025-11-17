import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Plane } from 'lucide-react'
import { subscribeFutureTrips, addFutureTrip, updateFutureTrip, deleteFutureTrip } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

export default function FutureTrips() {
  const { coupleCode } = useCouple()
  const [trips, setTrips] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    destination: '',
    estimatedDate: '',
    notes: '',
  })

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeFutureTrips(coupleCode, setTrips)
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateFutureTrip(editingId, formData)
      setEditingId(null)
    } else {
      await addFutureTrip(coupleCode, formData)
    }

    setFormData({ destination: '', estimatedDate: '', notes: '' })
    setShowForm(false)
  }

  const handleEdit = (trip) => {
    setFormData({
      destination: trip.destination,
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

  const filteredTrips = trips

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Future Trips ✈️</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ destination: '', estimatedDate: '', notes: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Trip'}
        </button>
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
