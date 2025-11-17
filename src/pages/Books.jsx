import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react'
import { subscribeBooks, addBook, updateBook, deleteBook } from '../services/firebase'

const statuses = ['Not Started', 'In Progress', 'Finished']

export default function Books() {
  const [books, setBooks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'Not Started',
    notes: '',
  })

  useEffect(() => {
    const unsubscribe = subscribeBooks(setBooks)
    return unsubscribe
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateBook(editingId, formData)
      setEditingId(null)
    } else {
      await addBook(formData)
    }

    setFormData({ title: '', author: '', status: 'Not Started', notes: '' })
    setShowForm(false)
  }

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      status: book.status,
      notes: book.notes || '',
    })
    setEditingId(book.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id)
    }
  }

  const filteredBooks = books.filter(book => {
    if (filterStatus === 'all') return true
    return book.status === filterStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      case 'In Progress':
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
        <h1 className="text-3xl font-bold text-gray-800">Books to Read Together 📚</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ title: '', author: '', status: 'Not Started', notes: '' })
          }}
          className="btn-primary inline-flex items-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'Add Book'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All ({books.length})
        </button>
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status} ({books.filter(b => b.status === status).length})
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {editingId ? 'Edit Book' : 'Add New Book'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              placeholder="Book title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="input"
              required
              placeholder="Author name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
            <select
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Your thoughts about this book..."
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingId ? 'Update Book' : 'Add Book'}
          </button>
        </form>
      )}

      {/* Books List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No books yet. Add your first book to read together! 📖</p>
          </div>
        ) : (
          filteredBooks.map(book => (
            <div key={book.id} className="card hover:shadow-2xl transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <BookOpen className="w-8 h-8 text-green-400" />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(book)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-1">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
              
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                {book.status}
              </span>

              {book.notes && (
                <p className="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-100">
                  {book.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
