import { beforeEach, describe, expect, it } from 'vitest'
import { clearStoredSession, readStoredSession, writeStoredSession } from './auth-storage'

const session = {
  token: 'secret-token',
  user: { id: '1', name: 'Ada', email: 'ada@example.com' },
}

describe('auth storage', () => {
  beforeEach(() => sessionStorage.clear())

  it('persists and restores a valid session', () => {
    writeStoredSession(session)
    expect(readStoredSession()).toEqual(session)
  })

  it('discards malformed persisted data', () => {
    sessionStorage.setItem('taskduty.session', '{"token":42}')
    expect(readStoredSession()).toBeNull()
    expect(sessionStorage.getItem('taskduty.session')).toBeNull()
  })

  it('clears the session on logout', () => {
    writeStoredSession(session)
    clearStoredSession()
    expect(readStoredSession()).toBeNull()
  })
})
