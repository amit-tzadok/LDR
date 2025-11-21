import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { subscribeUserProfile } from '../services/firebase'
import { Home, Heart, CheckCircle2, MoreHorizontal, LogOut, Moon, Sun, Star, User } from 'lucide-react'
import { Key } from 'lucide-react'
import CoupleSwitcher from './CoupleSwitcher'
import { getInitials } from '../utils/avatar'

export default function Layout() {
  const { signOut, currentUser } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')
  const [userPhoto, setUserPhoto] = useState(null)

  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = subscribeUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setUserName(profile.name || '')
        setUserPhoto(profile.photoURL || null)
      }
    })

    return unsubscribe
  }, [currentUser])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const navItems = [
    { path: '/', icon: <Home className="w-6 h-6" />, label: 'Home' },
    { path: '/daily-habits', icon: <CheckCircle2 className="w-6 h-6" />, label: 'Daily' },
    { path: '/date-ideas', icon: <Heart className="w-6 h-6" />, label: 'Date Ideas' },
    { path: '/gratitude', icon: <Star className="w-6 h-6" />, label: 'Gratitude' },
    { path: '/more', icon: <MoreHorizontal className="w-6 h-6" />, label: 'More' },
  ]

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-pink-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-green-500 bg-clip-text text-transparent">
              Our Space
            </h1>
            {userName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Hi, {userName} 👋
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CoupleSwitcher />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-pink-500" />
              )}
            </button>
            
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-pink-500" />
            </button>
            {currentUser && (
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full overflow-hidden ml-2 focus:outline-none"
                title="Open profile settings"
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="your avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-pink-600">
                    {(() => {
                      const initials = getInitials({ id: currentUser?.uid, name: userName })
                      return initials || <User className="w-5 h-5 text-pink-500" />
                    })()}
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-pink-100 dark:border-gray-700 shadow-lg transition-colors">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ path, icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-gray-400 hover:text-pink-400 dark:text-gray-500 dark:hover:text-pink-400'
              }`}
            >
                {icon}
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
