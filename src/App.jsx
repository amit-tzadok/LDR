import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion as m } from 'framer-motion'
import { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useCouple } from './contexts/CoupleContext'
import Login from './pages/Login'
import Home from './pages/Home'
import DateIdeas from './pages/DateIdeas'
import DateIdeasByLocation from './pages/DateIdeasByLocation'
import Books from './pages/Books'
import Shows from './pages/Shows'
import FutureTrips from './pages/FutureTrips'
import DreamTrips from './pages/DreamTrips'
import Invite from './pages/Invite'
import SpecialDates from './pages/SpecialDates'
import Gratitude from './pages/Gratitude'
import Milestones from './pages/Milestones'
import DailyHabits from './pages/DailyHabits'
import Profile from './pages/Profile'
import More from './pages/More'
import StickyNotes from './pages/StickyNotes'
import SpaceSettings from './pages/SpaceSettings'
import RecoverSpace from './pages/RecoverSpace'
import Layout from './components/Layout'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut'
}

function AnimatedPage({ children }) {
  return (
    <m.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </m.div>
  )
}

function ProtectedRoute({ children }) {
  const { hasCouple, loading } = useCouple()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-2xl text-pink-500 animate-pulse">Loading...</div>
      </div>
    )
  }
  
  // If user doesn't have a couple, redirect to invite page
  if (!hasCouple) {
    return <Navigate to="/invite" replace />
  }
  
  return children
}

function App() {
  const { currentUser, loading } = useAuth()
  const { hasCouple, loading: coupleLoading } = useCouple()
  const location = useLocation()
  const navigate = useNavigate()

  // If user lands on /invite but already has a couple (HashRouter uses the hash), send them to root
  useEffect(() => {
    const onInvitePath = location.pathname === '/invite' || (location.hash && location.hash.includes('/invite'))
    if (hasCouple && onInvitePath) {
      navigate('/', { replace: true })
    }
  }, [hasCouple, location.pathname, location.hash, navigate])

  if (loading || coupleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-2xl text-pink-500 animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={currentUser ? <Layout /> : <Navigate to={`/login${location.search}`} />}>
          <Route index element={hasCouple ? <AnimatedPage><Home /></AnimatedPage> : <Navigate to="/invite" replace />} />
          <Route path="date-ideas" element={<AnimatedPage><DateIdeas /></AnimatedPage>} />
          <Route path="date-ideas-by-location" element={<AnimatedPage><DateIdeasByLocation /></AnimatedPage>} />
          <Route path="books" element={<AnimatedPage><Books /></AnimatedPage>} />
          <Route path="shows" element={<AnimatedPage><Shows /></AnimatedPage>} />
          <Route path="future-trips" element={<AnimatedPage><FutureTrips /></AnimatedPage>} />
          <Route path="dream-trips" element={<AnimatedPage><DreamTrips /></AnimatedPage>} />
          <Route path="invite" element={<AnimatedPage><Invite /></AnimatedPage>} />
          <Route path="special-dates" element={<AnimatedPage><SpecialDates /></AnimatedPage>} />
          <Route path="gratitude" element={<AnimatedPage><Gratitude /></AnimatedPage>} />
          <Route path="milestones" element={<AnimatedPage><Milestones /></AnimatedPage>} />
          <Route path="daily-habits" element={<AnimatedPage><DailyHabits /></AnimatedPage>} />
          <Route path="sticky-notes" element={<AnimatedPage><StickyNotes /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
          <Route path="space-settings" element={<AnimatedPage><SpaceSettings /></AnimatedPage>} />
          <Route path="recover-space" element={<AnimatedPage><RecoverSpace /></AnimatedPage>} />
          <Route path="more" element={<AnimatedPage><More /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
