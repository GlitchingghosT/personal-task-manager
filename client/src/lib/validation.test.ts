import { describe, expect, it } from 'vitest'
import { validateAuth, validateTask } from './validation'

describe('form validation', () => {
  it('enforces the documented registration limits', () => {
    expect(validateAuth('register', { name: 'A', email: 'not-an-email', password: 'short' })).toEqual({
      name: 'Name must be between 2 and 80 characters.',
      email: 'Enter a valid email address.',
      password: 'Password must be between 8 and 128 characters.',
    })
  })

  it("rejects passwords over bcrypt's 72-byte UTF-8 limit", () => {
    expect(validateAuth('register', {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'é'.repeat(37),
    })).toEqual({ password: 'Password must be 72 UTF-8 bytes or fewer.' })
  })

  it('requires task fields and accepts contract-compliant values', () => {
    expect(validateTask({ title: '', description: '', tag: 'normal' })).toEqual({
      title: 'Title is required.',
      description: 'Description is required.',
    })
    expect(validateTask({ title: 'Ship integration', description: 'Connect every flow.', tag: 'important' })).toEqual({})
  })
})
