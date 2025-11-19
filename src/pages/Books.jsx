import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, BookOpen, Star, MessageCircle, Send } from 'lucide-react'
import { subscribeBooks, addBook, updateBook, deleteBook, subscribeBookDiscussions, addBookDiscussion, deleteBookDiscussion, getAllUserProfiles } from '../services/firebase'
import { useCouple } from '../contexts/CoupleContext'
import { useAuth } from '../contexts/AuthContext'

const statuses = ['Not Started', 'In Progress', 'Finished']

export default function Books() {
  const [books, setBooks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedBook, setSelectedBook] = useState(null)
  const [discussions, setDiscussions] = useState([])
  const [newDiscussion, setNewDiscussion] = useState('')
  const [userProfiles, setUserProfiles] = useState({})
  const { coupleCode } = useCouple()
  const { currentUser } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    status: 'Not Started',
    notes: '',
    rating: 0,
  })

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = subscribeBooks(coupleCode, setBooks)
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, setUserProfiles)
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!selectedBook) return
    const unsubscribe = subscribeBookDiscussions(selectedBook.id, setDiscussions)
    return unsubscribe
  }, [selectedBook])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await updateBook(editingId, formData)
      setEditingId(null)
    } else {
      await addBook(coupleCode, formData)
    }

    setFormData({ title: '', author: '', status: 'Not Started', notes: '', rating: 0 })
    setShowForm(false)
  }

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      status: book.status,
      notes: book.notes || '',
      rating: book.rating || 0,
    })
    setEditingId(book.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id)
    }
  }

  const handleDiscussionSubmit = async (e) => {
    e.preventDefault()
    if (newDiscussion.trim() && selectedBook) {
      await addBookDiscussion(selectedBook.id, {
        message: newDiscussion,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email
      })
      setNewDiscussion('')
    }
  }

  const handleDiscussionDelete = async (id) => {
    if (window.confirm('Delete this message?')) {
      await deleteBookDiscussion(id)
    }
  }

  const getAuthorName = (userId) => {
    const profile = userProfiles[userId]
    return profile?.name || profile?.email || 'Unknown'
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    )
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
            setFormData({ title: '', author: '', status: 'Not Started', notes: '', rating: 0 })
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Your thoughts about this book..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
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

              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{book.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">by {book.author}</p>
              
              {book.rating > 0 && (
                <div className="mb-3">
                  {renderStars(book.rating)}
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                  {book.status}
                </span>
                {book.status === 'In Progress' && (
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Discuss
                  </button>
                )}
              </div>

              {book.notes && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {book.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Discussion Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedBook.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">by {selectedBook.author}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBook(null)
                    setDiscussions([])
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {discussions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No discussions yet. Start the conversation!</p>
                </div>
              ) : (
                discussions.map(discussion => (
                  <div key={discussion.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                          {getAuthorName(discussion.createdBy)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {discussion.createdAt?.toDate ? new Date(discussion.createdAt.toDate()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          }) : 'Just now'}
                        </span>
                      </div>
                      {discussion.createdBy === currentUser.uid && (
                        <button
                          onClick={() => handleDiscussionDelete(discussion.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{discussion.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleDiscussionSubmit} className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="input flex-1"
                  required
                />
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
