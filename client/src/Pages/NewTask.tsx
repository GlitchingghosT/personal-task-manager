import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TaskForm } from '../components/TaskForm'
import { useAuth } from '../context/auth-context'
import { ApiError, type TaskInput } from '../lib/api'
import type { FieldErrors } from '../lib/validation'

export default function NewTask() {
  const { api, logout } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function create(values: TaskInput) {
    setPending(true); setError(''); setFieldErrors({})
    try { await api.createTask(values); navigate('/tasks') }
    catch (reason) {
      if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
      else if (reason instanceof ApiError) { setError(reason.message); setFieldErrors(reason.fields ?? {}) }
      else setError('Unable to create this task.')
    } finally { setPending(false) }
  }

  return <main className="page narrow container"><Link className="back-link" to="/tasks">← Back to tasks</Link><div className="form-heading"><span className="eyebrow">Add something to your list</span><h1>New task</h1></div><TaskForm submitLabel="Create task" pending={pending} serverError={error} serverFieldErrors={fieldErrors} onSubmit={create} /></main>
}
