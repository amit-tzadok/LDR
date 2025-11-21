import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Sparkles, TrendingUp, BarChart3 } from 'lucide-react'
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
  const [showAnalytics, setShowAnalytics] = useState(false)
  const { currentUser } = useAuth()

  console.log('DailyHabits - coupleCode:', coupleCode, 'currentUser:', currentUser?.email)

  useEffect(() => {
    console.log('DailyHabits habits useEffect - coupleCode:', coupleCode)
    if (!coupleCode) return
    const unsubscribe = getDailyHabits(coupleCode, (data) => {
      console.log('Received daily habits:', data)
      setHabits(data)
    })
    return unsubscribe
  }, [coupleCode])

  useEffect(() => {
    console.log('DailyHabits profiles useEffect - coupleCode:', coupleCode)
    if (!coupleCode) return
    const unsubscribe = getAllUserProfiles(coupleCode, (profiles) => {
      console.log('Received user profiles:', profiles)
      setUserProfiles(profiles)
    })
    return unsubscribe
  }, [coupleCode])

  const getTodayDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
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

  const getPartnerName = () => {
    // Find partner email from any completion
    const partnerEmail = Object.values(userProfiles).find(
      profile => profile.email !== currentUser.email
    )?.email
    
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
      const year = checkDate.getFullYear()
      const month = String(checkDate.getMonth() + 1).padStart(2, '0')
      const day = String(checkDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
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
      console.log('Adding habit with coupleCode:', coupleCode, 'habit:', newHabit)
      try {
        await addDailyHabit(coupleCode, {
          habit: newHabit,
          createdBy: currentUser.email,
          completions: {},
          createdAt: Date.now()
        })
        console.log('Habit added successfully')
        setNewHabit('')
        setShowForm(false)
      } catch (error) {
        console.error('Error adding habit:', error)
        alert('Failed to add habit: ' + error.message)
      }
    }
  }

  const handleToggle = async (habit) => {
    console.log('Toggling habit:', habit.id)
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
    
    console.log('Updating habit with completions:', updatedCompletions)
    try {
      await updateDailyHabit(habit.id, { completions: updatedCompletions })
      console.log('Habit updated successfully')
    } catch (error) {
      console.error('Error updating habit:', error)
      alert('Failed to update habit: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this habit?')) {
      await deleteDailyHabit(id)
    }
  }

  const completedCount = habits.filter(h => isCompletedToday(h)).length

  // Analytics functions
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      days.push({
        date: `${year}-${month}-${day}`,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      })
    }
    return days
  }

  const getCompletionRate = () => {
    if (habits.length === 0) return 0
    const last7Days = getLast7Days()
    let totalPossible = habits.length * 7
    let totalCompleted = 0
    
    habits.forEach(habit => {
      last7Days.forEach(day => {
        if (habit.completions?.[day.date]?.both) {
          totalCompleted++
        }
      })
    })
    
    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
  }

  const getLongestStreak = () => {
    if (habits.length === 0) return 0
    return Math.max(...habits.map(h => getStreak(h)))
  }

  const getTotalCompletions = () => {
    let total = 0
    habits.forEach(habit => {
      if (habit.completions) {
        Object.keys(habit.completions).forEach(date => {
          if (habit.completions[date].both) total++
        })
      }
    })
    return total
  }

  const getCompletionsForDay = (dateStr) => {
    let count = 0
    habits.forEach(habit => {
      if (habit.completions?.[dateStr]?.both) {
        count++
      }
    })
    return count
  }

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
            {habits.length > 0 && getLongestStreak() > 0 && (
              <span className="text-lg bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full font-bold">
                🔥 {getLongestStreak()} day{getLongestStreak() !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Build healthy habits together
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAnalytics
                ? 'bg-pink-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Habit
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && habits.length > 0 && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-2 border-pink-200 dark:border-pink-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">7-Day Rate</p>
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{getCompletionRate()}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{getLongestStreak()} 🔥</p>
                </div>
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Completions</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{getTotalCompletions()}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Weekly View */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              Last 7 Days
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {getLast7Days().map(day => {
                const completions = getCompletionsForDay(day.date)
                const percentage = habits.length > 0 ? (completions / habits.length) * 100 : 0
                const isToday = day.date === getTodayDate()
                
                return (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {day.dayName}
                    </div>
                    <div 
                      className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                        percentage === 100 
                          ? 'bg-green-500 text-white' 
                          : percentage > 0 
                          ? 'bg-yellow-400 text-gray-800'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      } ${isToday ? 'ring-2 ring-pink-500' : ''}`}
                    >
                      <div className="text-xs font-bold">{day.dayNumber}</div>
                      <div className="text-xs">{completions}/{habits.length}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400">All done</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-400"></div>
                <span className="text-gray-600 dark:text-gray-400">Partial</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800"></div>
                <span className="text-gray-600 dark:text-gray-400">None</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-lg font-medium ${
                          completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {habit.habit}
                      </h3>
                      {streak > 0 && (
                        <span className="text-xs bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-1 rounded-full font-bold">
                          🔥 {streak} day{streak !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
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
