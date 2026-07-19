import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { ApiError, type Task } from '../lib/api'

const tagLabels = { urgent: 'Urgent', important: 'Important', normal: 'Normal' }

export default function MyTask() {
  const { api, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('')
    try { setTasks((await api.getTasks()).tasks) }
    catch (reason) {
      if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
      else setError(reason instanceof ApiError ? reason.message : 'Unable to load your tasks.')
    } finally { setLoading(false) }
  }, [api, logout])

  useEffect(() => {
    let active = true
    api.getTasks()
      .then(({ tasks: loadedTasks }) => { if (active) setTasks(loadedTasks) })
      .catch((reason: unknown) => {
        if (!active) return
        if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
        else setError(reason instanceof ApiError ? reason.message : 'Unable to load your tasks.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [api, logout])

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return
    setDeletingId(task.id); setError('')
    try {
      await api.deleteTask(task.id)
      setTasks((current) => current.filter(({ id }) => id !== task.id))
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === 'UNAUTHENTICATED') logout()
      else setError(reason instanceof ApiError ? reason.message : 'Unable to delete this task.')
    } finally { setDeletingId(null) }
  }

  return (
    <main className="page container">
      <div className="page-heading"><div><span className="eyebrow">Your workspace</span><h1>My tasks</h1></div><Link className="button button-primary" to="/tasks/new">+ Add new task</Link></div>
      {loading ? <div className="center-state" aria-live="polite"><div className="spinner" aria-hidden="true" /><p>Loading your tasks…</p></div>
        : error ? <div className="alert alert-error" role="alert"><span>{error}</span><button type="button" onClick={() => void loadTasks()}>Try again</button></div>
          : tasks.length === 0 ? <section className="empty-state"><div className="empty-icon" aria-hidden="true">✓</div><h2>No tasks yet</h2><p>Add the first thing you want to get done.</p><Link className="button button-primary" to="/tasks/new">Create a task</Link></section>
          : <section className="task-list" aria-label="Task list">{tasks.map((task) => <article className="task-card" key={task.id}><div className="task-card-top"><span className={`tag tag-${task.tag}`}>{tagLabels[task.tag]}</span><time dateTime={task.createdAt}>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(task.createdAt))}</time></div><h2>{task.title}</h2><p>{task.description}</p><div className="task-actions"><Link className="button button-primary button-small" to={`/tasks/${encodeURIComponent(task.id)}/edit`}>Edit task</Link><button className="button button-danger button-small" type="button" disabled={deletingId === task.id} onClick={() => void removeTask(task)}>{deletingId === task.id ? 'Deleting…' : 'Delete'}</button></div></article>)}</section>}
    </main>
  )
}
