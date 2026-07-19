import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createApiClient, type User } from '../lib/api'
import { clearStoredSession, readStoredSession, writeStoredSession, type StoredSession } from '../lib/auth-storage'
import { AuthContext, type AuthContextValue } from './auth-context'

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:2100/api' : '')

if (!apiUrl) {
  throw new Error('VITE_API_URL is required outside development mode')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState<StoredSession | null>(readStoredSession)
  const [user, setUser] = useState<User | null>(initial?.user ?? null)
  const [ready, setReady] = useState(!initial)
  const api = useMemo(() => createApiClient(apiUrl, () => readStoredSession()?.token ?? null), [])

  const logout = useCallback(() => {
    setUser(null)
    clearStoredSession()
  }, [])

  useEffect(() => {
    if (!initial) return
    api.me()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        writeStoredSession({ token: initial.token, user: currentUser })
      })
      .catch(logout)
      .finally(() => setReady(true))
  }, [api, initial, logout])

  const establishSession = useCallback((session: { user: User; token: string }) => {
    setUser(session.user)
    writeStoredSession(session)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    api,
    login: async (input) => establishSession(await api.login(input)),
    register: async (input) => establishSession(await api.register(input)),
    logout,
  }), [api, establishSession, logout, ready, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
