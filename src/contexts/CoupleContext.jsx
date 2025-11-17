import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getUserCoupleCode } from '../services/coupleService'

const CoupleContext = createContext()

export function useCouple() {
  return useContext(CoupleContext)
}

export function CoupleProvider({ children }) {
  const [coupleCode, setCoupleCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    const loadCoupleCode = async () => {
      if (currentUser) {
        try {
          const code = await getUserCoupleCode(currentUser.uid)
          setCoupleCode(code)
        } catch (error) {
          console.error('Error loading couple code:', error)
        }
      } else {
        setCoupleCode(null)
      }
      setLoading(false)
    }

    loadCoupleCode()
  }, [currentUser])

  const value = {
    coupleCode,
    setCoupleCode,
    loading
  }

  return (
    <CoupleContext.Provider value={value}>
      {children}
    </CoupleContext.Provider>
  )
}
