export type TaskTag = 'urgent' | 'important' | 'normal'

export interface User {
  id: string
  name: string
  email: string
}

export interface Task {
  id: string
  title: string
  description: string
  tag: TaskTag
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface TaskInput {
  title: string
  description: string
  tag: TaskTag
}

export type TaskUpdate = Partial<TaskInput>

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly fields?: Record<string, string>

  constructor(message: string, status: number, code: ApiErrorCode, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

interface ErrorEnvelope {
  error?: {
    code?: ApiErrorCode
    message?: string
    fields?: Record<string, string>
  }
}

export function createApiClient(baseUrl: string, getToken: () => string | null) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')

  async function request<T>(path: string, init: RequestInit = {}, protectedRoute = true): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    const token = protectedRoute ? getToken() : null
    if (token) headers.set('Authorization', `Bearer ${token}`)

    let response: Response
    try {
      response = await fetch(`${normalizedBaseUrl}${path}`, { ...init, headers })
    } catch {
      throw new ApiError('Unable to reach TaskDuty. Check your connection and try again.', 0, 'INTERNAL_ERROR')
    }

    if (!response.ok) {
      let envelope: ErrorEnvelope = {}
      try {
        envelope = await response.json() as ErrorEnvelope
      } catch {
        // The server contract is JSON, but keep the UI safe if an intermediary returns HTML.
      }
      throw new ApiError(
        envelope.error?.message ?? 'Something went wrong. Please try again.',
        response.status,
        envelope.error?.code ?? 'INTERNAL_ERROR',
        envelope.error?.fields,
      )
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  return {
    register: (input: RegisterInput) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) }, false),
    login: (input: LoginInput) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) }, false),
    me: () => request<{ user: User }>('/auth/me'),
    getTasks: () => request<{ tasks: Task[] }>('/tasks'),
    getTask: (id: string) => request<{ task: Task }>(`/tasks/${encodeURIComponent(id)}`),
    createTask: (input: TaskInput) => request<{ task: Task }>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
    updateTask: (id: string, input: TaskUpdate) => request<{ task: Task }>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }),
    deleteTask: (id: string) => request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
