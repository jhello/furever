import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api'
import { clearToken, getSavedEmail, getToken, setSavedEmail, setToken } from '../storage'

interface AuthContextValue {
  user: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateEmail: (email: string) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
  updateEmail: () => undefined,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then((data) => {
        if (!active) return
        setUser(data.email)
        setSavedEmail(data.email)
      })
      .catch(() => {
        if (!active) return
        clearToken()
        setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => {
      const result = await api.login(email, password)
      setToken(result.token)
      setSavedEmail(result.email)
      setUser(result.email)
    },
    register: async (email, password) => {
      const result = await api.register(email, password)
      setToken(result.token)
      setSavedEmail(result.email)
      setUser(result.email)
    },
    logout: async () => {
      try {
        await api.logout()
      } finally {
        clearToken()
        setUser(null)
      }
    },
    updateEmail: (email) => {
      setSavedEmail(email)
      setUser(email)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}

export function getInitialEmail(): string | null {
  return getSavedEmail()
}
