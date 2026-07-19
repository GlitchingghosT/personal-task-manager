import { createContext, useContext } from 'react'
import type { ApiClient, LoginInput, RegisterInput, User } from '../lib/api'

export interface AuthContextValue {
  user: User | null
  ready: boolean
  api: ApiClient
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
