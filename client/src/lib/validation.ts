import type { LoginInput, RegisterInput, TaskInput } from './api'

export type FieldErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAuth(mode: 'login' | 'register', values: RegisterInput | LoginInput): FieldErrors {
  const errors: FieldErrors = {}
  if (mode === 'register' && 'name' in values) {
    const length = values.name.trim().length
    if (length < 2 || length > 80) errors.name = 'Name must be between 2 and 80 characters.'
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (values.password.length < 8 || values.password.length > 128) {
    errors.password = 'Password must be between 8 and 128 characters.'
  } else if (new TextEncoder().encode(values.password).length > 72) {
    errors.password = 'Password must be 72 UTF-8 bytes or fewer.'
  }
  return errors
}

export function validateTask(values: TaskInput): FieldErrors {
  const errors: FieldErrors = {}
  const titleLength = values.title.trim().length
  const descriptionLength = values.description.trim().length
  if (!titleLength) errors.title = 'Title is required.'
  else if (titleLength > 120) errors.title = 'Title must be 120 characters or fewer.'
  if (!descriptionLength) errors.description = 'Description is required.'
  else if (descriptionLength > 2000) errors.description = 'Description must be 2,000 characters or fewer.'
  return errors
}
