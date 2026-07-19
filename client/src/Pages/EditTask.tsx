import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TaskForm } from '../components/TaskForm'
import { useAuth } from '../context/auth-context'
import { ApiError, type Task, type TaskInput } from '../lib/api'
import type { FieldErrors } from '../lib/validation'

export default function EditTask() {
  const { id = '' } = useParams()
  const { api, logout } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadTask = useCallback(async () => {
    setLoading(true); setLoadError('')
    try { setTask((await api.getTask(id)).task) }
    catch (reason) {
      if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
      else setLoadError(reason instanceof ApiError ? reason.message : 'Unable to load this task.')
    } finally { setLoading(false) }
  }, [api, id, logout])

  useEffect(() => {
    let active = true
    api.getTask(id)
      .then(({ task: loadedTask }) => { if (active) setTask(loadedTask) })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
        else setLoadError(reason instanceof ApiError ? reason.message : 'Unable to load this task.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [api, id, logout])

  async function update(values: TaskInput) {
    setPending(true); setError(''); setFieldErrors({})
    try { await api.updateTask(id, values); navigate('/tasks') }
    catch (reason) {
      if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
      else if (reason instanceof ApiError) { setError(reason.message); setFieldErrors(reason.fields ?? {}) }
      else setError('Unable to update this task.')
    } finally { setPending(false) }
  }

  return <main className="page narrow container"><Link className="back-link" to="/tasks">← Back to tasks</Link>{loading ? <div className="center-state" aria-live="polite"><div className="spinner" aria-hidden="true" /><p>Loading task…</p></div> : loadError ? <div className="empty-state"><h1>Task unavailable</h1><p role="alert">{loadError}</p><div className="inline-actions"><button className="button button-primary" type="button" onClick={() => void loadTask()}>Try again</button><Link className="button button-secondary" to="/tasks">All tasks</Link></div></div> : task && <><div className="form-heading"><span className="eyebrow">Update this task</span><h1>Edit task</h1></div><TaskForm initialValues={{ title: task.title, description: task.description, tag: task.tag }} submitLabel="Save changes" pending={pending} serverError={error} serverFieldErrors={fieldErrors} onSubmit={update} /></>}</main>
}
