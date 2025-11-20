import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { subscribeUserProfile } from '../services/firebase'
import { Home, Heart, CheckCircle2, Award, MoreHorizontal, LogOut, Moon, Sun, Settings } from 'lucide-react'
import CoupleSwitcher from './CoupleSwitcher'

export default function Layout() {
  const { signOut, currentUser } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = subscribeUserProfile(currentUser.uid, (profile) => {
      if (profile) {
        setUserName(profile.name || '')
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
    { path: '/', icon: Home, label: 'Home' },
    { path: '/daily-habits', icon: CheckCircle2, label: 'Daily' },
    { path: '/date-ideas', icon: Heart, label: 'Date Ideas' },
    { path: '/gratitude', icon: Heart, label: 'Gratitude' },
    { path: '/more', icon: MoreHorizontal, label: 'More' },
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
              onClick={() => navigate('/more')}
              className="p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-pink-500" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-pink-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-pink-100 dark:border-gray-700 shadow-lg transition-colors">
        <div className="flex justify-around items-center py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-gray-400 hover:text-pink-400 dark:text-gray-500 dark:hover:text-pink-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
