import { useNavigate } from 'react-router-dom'
import { MapPin, BookOpen, Tv, Plane, Sparkles, UserPlus, User, Settings, StickyNote } from 'lucide-react'

export default function More() {
  const navigate = useNavigate()

  const moreItems = [
    { 
      title: 'Profile', 
      icon: User, 
      path: '/profile',
      gradient: 'from-pink-400 to-pink-500',
      description: 'Update your name and settings'
    },
    { 
      title: 'Space Settings', 
      icon: Settings, 
      path: '/space-settings',
      gradient: 'from-purple-400 to-indigo-500',
      description: 'Manage your shared space'
    },
    { 
      title: 'Sticky Notes', 
      icon: StickyNote, 
      path: '/sticky-notes',
      gradient: 'from-yellow-300 to-orange-400',
      description: 'Quick notes for your partner'
    },
    { 
      title: 'Books', 
      icon: BookOpen, 
      path: '/books',
      gradient: 'from-pink-200 to-green-300',
      description: 'Books to read together'
    },
    { 
      title: 'Shows & Movies', 
      icon: Tv, 
      path: '/shows',
      gradient: 'from-green-300 to-green-400',
      description: 'Shows and movies to watch together'
    },
    { 
      title: 'Gratitude Wall', 
      icon: Sparkles, 
      path: '/gratitude',
      gradient: 'from-yellow-300 to-pink-400',
      description: 'Things we appreciate'
    },
    { 
      title: 'Invite Partner', 
      icon: UserPlus, 
      path: '/invite',
      gradient: 'from-pink-300 to-pink-400',
      description: 'Share this app'
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <Settings className="w-8 h-8 text-pink-500" />
          More
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Additional features and settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {moreItems.map(({ title, icon: Icon, path, gradient, description }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="nav-card text-left group"
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
