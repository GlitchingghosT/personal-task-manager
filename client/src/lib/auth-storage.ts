import type { User } from './api'

const STORAGE_KEY = 'taskduty.session'

export interface StoredSession {
  token: string
  user: User
}

function isSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StoredSession>
  return typeof candidate.token === 'string' && Boolean(candidate.token)
    && Boolean(candidate.user) && typeof candidate.user?.id === 'string'
    && typeof candidate.user?.name === 'string' && typeof candidate.user?.email === 'string'
}

export function readStoredSession(): StoredSession | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    if (isSession(value)) return value
  } catch {
    // Invalid browser storage should behave like a signed-out session.
  }
  sessionStorage.removeItem(STORAGE_KEY)
  return null
}

export function writeStoredSession(session: StoredSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
