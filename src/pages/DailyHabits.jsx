import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Sparkles } from 'lucide-react'
import { getDailyHabits, addDailyHabit, updateDailyHabit, deleteDailyHabit, getAllUserProfiles } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCouple } from '../contexts/CoupleContext'

export default function DailyHabits() {
  const { coupleCode } = useCouple()
  const [habits, setHabits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newHabit, setNewHabit] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [userProfiles, setUserProfiles] = useState({})
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getDailyHabits(coupleCode, (data) => {
      setHabits(data)
    })
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, (profiles) => {
      setUserProfiles(profiles)
    })
    return unsubscribe
  }, [coupleCode])

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const isCompletedToday = (habit) => {
    const today = getTodayDate()
    const completions = habit.completions || {}
    return completions[today]?.both === true
  }

  const getMyCompletion = (habit) => {
    const today = getTodayDate()
    const completions = habit.completions || {}
    return completions[today]?.[currentUser.email] === true
  }

  const getPartnerCompletion = (habit) => {
    const today = getTodayDate()
    const completions = habit.completions || {}
    const users = Object.keys(completions[today] || {}).filter(key => key !== 'both')
    const partner = users.find(email => email !== currentUser.email)
    return partner ? completions[today][partner] === true : false
  }

  const getPartnerName = (habit) => {
    const today = getTodayDate()
    const completions = habit.completions || {}
    const users = Object.keys(completions[today] || {}).filter(key => key !== 'both')
    const partnerEmail = users.find(email => email !== currentUser.email)
    
    if (!partnerEmail) return 'Partner'
    
    // Find profile by matching email
    const partnerProfile = Object.values(userProfiles).find(profile => profile.email === partnerEmail)
    return partnerProfile?.name || 'Partner'
  }

  const getMyName = () => {
    const myProfile = userProfiles[currentUser.uid]
    return myProfile?.name || 'You'
  }

  const getStreak = (habit) => {
    if (!habit.completions) return 0
    
    const dates = Object.keys(habit.completions).filter(date => habit.completions[date].both === true).sort().reverse()
    if (dates.length === 0) return 0
    
    let streak = 0
    let currentDate = new Date()
    
    for (let i = 0; i < dates.length + 1; i++) {
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      if (dates.includes(dateStr)) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const allCompleted = habits.length > 0 && habits.every(habit => isCompletedToday(habit))

  useEffect(() => {
    if (allCompleted && habits.length > 0) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 5000)
    }
  }, [allCompleted, habits.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newHabit.trim()) {
      await addDailyHabit(coupleCode, {
        habit: newHabit,
        createdBy: currentUser.email,
        completions: {},
        createdAt: Date.now()
      })
      setNewHabit('')
      setShowForm(false)
    }
  }

  const handleToggle = async (habit) => {
    const today = getTodayDate()
    const completions = habit.completions || {}
    const todayCompletions = completions[today] || {}
    
    // Toggle current user's completion
    const myNewStatus = !todayCompletions[currentUser.email]
    const updatedTodayCompletions = {
      ...todayCompletions,
      [currentUser.email]: myNewStatus
    }
    
    // Check if both users have completed (assuming 2 users)
    const users = Object.keys(updatedTodayCompletions).filter(key => key !== 'both')
    const allCompleted = users.length >= 2 && users.every(email => updatedTodayCompletions[email] === true)
    
    updatedTodayCompletions.both = allCompleted
    
    const updatedCompletions = {
      ...completions,
      [today]: updatedTodayCompletions
    }
    
    await updateDailyHabit(habit.id, { completions: updatedCompletions })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this habit?')) {
      await deleteDailyHabit(id)
    }
  }

  const completedCount = habits.filter(h => isCompletedToday(h)).length

  return (
    <div className="space-y-6">
      {/* Celebration Banner */}
      {showCelebration && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-pink-500 to-green-500 text-white px-8 py-4 rounded-full shadow-2xl">
            <div className="flex items-center gap-3 text-xl font-bold">
              <Sparkles className="w-6 h-6" />
              All habits completed! 🎉
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-pink-500" />
            Daily Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Build healthy habits together
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Habit
        </button>
      </div>

      {/* Progress Card */}
      {habits.length > 0 && (
        <div className={`card transition-all ${allCompleted ? 'bg-gradient-to-r from-pink-500 to-green-500 text-white' : 'bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${allCompleted ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              Today's Progress
            </h2>
            <Calendar className={`w-6 h-6 ${allCompleted ? 'text-white' : 'text-pink-500'}`} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${allCompleted ? 'bg-white' : 'bg-gradient-to-r from-pink-400 to-green-400'}`}
                style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
              />
            </div>
            <div className={`text-2xl font-bold ${allCompleted ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              {completedCount}/{habits.length}
            </div>
          </div>
          {allCompleted && (
            <p className="text-center mt-3 text-white font-medium">
              Amazing work! All habits completed! 🌟
            </p>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            New Daily Habit
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              className="input"
              placeholder="e.g., Send a good morning text, Exercise together, Read 10 pages"
              required
              autoFocus
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setNewHabit('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No habits yet</p>
          <p className="text-gray-400 mt-2">Add your first daily habit to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit)
            const myCompleted = getMyCompletion(habit)
            const partnerCompleted = getPartnerCompletion(habit)
            const streak = getStreak(habit)
            
            return (
              <div
                key={habit.id}
                className={`card transition-all ${
                  completed
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-600'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(habit)}
                    className={`flex-shrink-0 transition-all ${
                      myCompleted
                        ? 'text-green-500 scale-110'
                        : 'text-gray-300 dark:text-gray-600 hover:text-green-400'
                    }`}
                  >
                    {myCompleted ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <Circle className="w-8 h-8" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-medium ${
                        completed
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {habit.habit}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <span className={myCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                          {getMyName()} {myCompleted ? '✓' : '○'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className={partnerCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                          {getPartnerName(habit)} {partnerCompleted ? '✓' : '○'}
                        </span>
                      </div>
                      {streak > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          🔥 {streak} day streak!
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
