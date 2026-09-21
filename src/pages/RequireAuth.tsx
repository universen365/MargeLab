import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

export function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-[var(--muted)]">
        Chargement…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
