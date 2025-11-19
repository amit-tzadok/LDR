import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Sparkles, ArrowRight } from 'lucide-react'
import { subscribeDreamTrips, addDreamTrip, updateDreamTrip, deleteDreamTrip, addFutureTrip } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'

export default function DreamTrips() {
  const { coupleCode } = useCouple()
  const [trips, setTrips] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    destination: '',
    why: '',
    pictureUrl: '',
  })

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeDreamTrips(coupleCode, setTrips)
    return unsubscribe
  }, [coupleCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateDreamTrip(editingId, formData)
      setEditingId(null)
    } else {
      await addDreamTrip(coupleCode, formData)
    }

    setFormData({ destination: '', why: '', pictureUrl: '' })
    setShowForm(false)
  }

  const handleEdit = (trip) => {
    setFormData({
      destination: trip.destination,
      why: trip.why || '',
      pictureUrl: trip.pictureUrl || '',
    })
    setEditingId(trip.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dream trip?')) {
      await deleteDreamTrip(id)
    }
  }

  const handleTransfer = async (trip) => {
    if (window.confirm(`Transfer "${trip.destination}" to Future Trips?`)) {
      try {
        await addFutureTrip(coupleCode, {
          destination: trip.destination,
          estimatedDate: '',
          notes: trip.why || ''
        })
        await deleteDreamTrip(trip.id)
      } catch (error) {
        console.error('Error transferring trip:', error)
        alert('Failed to transfer trip')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dream Trips ✨</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ destination: '', why: '', pictureUrl: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Dream'}
        </button>
      </div>

      <p className="text-gray-600 text-center">
        Our bucket list of places we dream of visiting together someday 💫
      </p>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Edit Dream Trip' : 'Add Dream Trip'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="input"
              required
              placeholder="Where do we dream of going?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Why?</label>
            <textarea
              value={formData.why}
              onChange={(e) => setFormData({ ...formData, why: e.target.value })}
              className="input"
              rows={3}
              placeholder="Why is this place special to us?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Picture URL</label>
            <input
              type="url"
              value={formData.pictureUrl}
              onChange={(e) => setFormData({ ...formData, pictureUrl: e.target.value })}
              className="input"
              placeholder="https://example.com/image.jpg (optional)"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Update Dream' : 'Add Dream'}
          </button>
        </form>
      )}

      {/* Dream Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No dream trips yet. Add your first bucket list destination! 🌍</p>
          </div>
        ) : (
          trips.map(trip => (
            <div key={trip.id} className="card hover:shadow-2xl transition-all overflow-hidden p-0">
              {trip.pictureUrl && (
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={trip.pictureUrl} 
                    alt={trip.destination}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <Sparkles className="w-8 h-8 text-green-400" />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTransfer(trip)}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors"
                      title="Transfer to Future Trips"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
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

                <h3 className="text-xl font-bold text-gray-800 mb-3">{trip.destination}</h3>
                
                {trip.why && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {trip.why}
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
