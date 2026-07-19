import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export function ProtectedRoute() {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <main className="center-state" aria-live="polite"><div className="spinner" aria-hidden="true" /><p>Restoring your session…</p></main>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}
