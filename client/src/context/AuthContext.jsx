import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  clearLocalSession,
  getCurrentSession,
  login as loginRequest,
  logout as logoutRequest,
  readStoredSession,
  register as registerRequest,
} from '../services/authService.js'
import { setApiAccessToken } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession()?.user || null)
  const [isLoading, setIsLoading] = useState(() => Boolean(readStoredSession()?.accessToken))

  const clearSession = useCallback(() => {
    clearLocalSession()
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true
    const stored = readStoredSession()
    if (!stored?.accessToken) {
      return () => { active = false }
    }

    setApiAccessToken(stored.accessToken)
    getCurrentSession()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        if (active && error.status === 401) clearSession()
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [clearSession])

  useEffect(() => {
    function onSessionExpired() {
      clearSession()
    }
    window.addEventListener('threadly:session-expired', onSessionExpired)
    return () => window.removeEventListener('threadly:session-expired', onSessionExpired)
  }, [clearSession])

  const signIn = useCallback(async (credentials) => {
    const session = await loginRequest(credentials)
    setUser(session.user)
    return session.user
  }, [])

  const signUp = useCallback(async (details) => {
    const session = await registerRequest(details)
    setUser(session.user)
    return session.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((current) => current ? { ...current, ...updates } : current)
  }, [])

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
    updateUser,
  }), [isLoading, signIn, signOut, signUp, updateUser, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
