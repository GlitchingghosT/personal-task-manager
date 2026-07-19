import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { ApiError } from '../lib/api'
import { validateAuth, type FieldErrors } from '../lib/validation'

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const isRegister = mode === 'register'

  if (user) return <Navigate to="/tasks" replace />

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    const input = { ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() }
    const nextErrors = validateAuth(mode, input)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      if (nextErrors.name) nameRef.current?.focus()
      else if (nextErrors.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }
    setPending(true)
    try {
      if (isRegister) await register(input)
      else await login({ email: input.email, password: input.password })
      const requested = (location.state as { from?: string } | null)?.from
      navigate(requested?.startsWith('/tasks') ? requested : '/tasks', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message)
        setErrors(error.fields ?? {})
      } else setMessage('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  const update = (field: keyof typeof values, value: string) => {
    setValues({ ...values, [field]: value })
    setErrors({ ...errors, [field]: '' })
  }

  return (
    <main className="auth-page container">
      <section className="auth-card" aria-labelledby="auth-heading">
        <span className="eyebrow">{isRegister ? 'Start organizing' : 'Welcome back'}</span>
        <h1 id="auth-heading">{isRegister ? 'Create your account' : 'Log in to TaskDuty'}</h1>
        <p>{isRegister ? 'Set up an account, then add your first task.' : 'Pick up where you left off.'}</p>
        {message && <div className="alert alert-error" role="alert">{message}</div>}
        <form onSubmit={handleSubmit} noValidate>
          {isRegister && <div className="field"><label htmlFor="name">Name</label><input ref={nameRef} id="name" autoComplete="name" minLength={2} maxLength={80} value={values.name} onChange={(e) => update('name', e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} /><span className="field-error" id="name-error">{errors.name}</span></div>}
          <div className="field"><label htmlFor="email">Email address</label><input ref={emailRef} id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => update('email', e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} /><span className="field-error" id="email-error">{errors.email}</span></div>
          <div className="field"><label htmlFor="password">Password</label><input ref={passwordRef} id="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} maxLength={128} value={values.password} onChange={(e) => update('password', e.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} /><span className="field-error" id="password-error">{errors.password}</span></div>
          <button className="button button-primary button-block" disabled={pending} type="submit">{pending ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to TaskDuty?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
      </section>
    </main>
  )
}
