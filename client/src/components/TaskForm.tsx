import { useRef, useState, type FormEvent } from 'react'
import type { FieldErrors } from '../lib/validation'
import { validateTask } from '../lib/validation'
import type { TaskInput } from '../lib/api'

interface TaskFormProps {
  initialValues?: TaskInput
  submitLabel: string
  pending?: boolean
  serverError?: string
  serverFieldErrors?: FieldErrors
  onSubmit: (values: TaskInput) => Promise<void>
}

const defaults: TaskInput = { title: '', description: '', tag: 'normal' }

export function TaskForm({
  initialValues = defaults,
  submitLabel,
  pending = false,
  serverError,
  serverFieldErrors = {},
  onSubmit,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskInput>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const visibleErrors = { ...serverFieldErrors, ...errors }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = { ...values, title: values.title.trim(), description: values.description.trim() }
    const nextErrors = validateTask(trimmed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      if (nextErrors.title) titleRef.current?.focus()
      else descriptionRef.current?.focus()
      return
    }
    await onSubmit(trimmed)
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
      <div className="field">
        <label htmlFor="task-title">Task title</label>
        <input
          ref={titleRef}
          id="task-title"
          value={values.title}
          maxLength={120}
          aria-invalid={Boolean(visibleErrors.title)}
          aria-describedby={visibleErrors.title ? 'task-title-error' : undefined}
          onChange={(event) => { setValues({ ...values, title: event.target.value }); setErrors({ ...errors, title: '' }) }}
          placeholder="e.g. Finish API integration"
        />
        <div className="field-meta"><span id="task-title-error" className="field-error">{visibleErrors.title}</span><span>{values.title.length}/120</span></div>
      </div>
      <div className="field">
        <label htmlFor="task-description">Description</label>
        <textarea
          ref={descriptionRef}
          id="task-description"
          value={values.description}
          maxLength={2000}
          rows={8}
          aria-invalid={Boolean(visibleErrors.description)}
          aria-describedby={visibleErrors.description ? 'task-description-error' : undefined}
          onChange={(event) => { setValues({ ...values, description: event.target.value }); setErrors({ ...errors, description: '' }) }}
          placeholder="Briefly describe your task"
        />
        <div className="field-meta"><span id="task-description-error" className="field-error">{visibleErrors.description}</span><span>{values.description.length}/2000</span></div>
      </div>
      <div className="field">
        <label htmlFor="task-priority">Priority</label>
        <select id="task-priority" value={values.tag} onChange={(event) => setValues({ ...values, tag: event.target.value as TaskInput['tag'] })}>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
        </select>
      </div>
      <button className="button button-primary button-block" type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
