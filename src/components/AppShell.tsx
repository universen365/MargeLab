import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from './Button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl mx-1 my-1.5 text-xs font-semibold transition',
    isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
      : 'text-[var(--muted)] hover:bg-[var(--surface)]',
  ].join(' ')

export function AppShell() {
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-24 pt-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            MargeLab
          </p>
          <h1 className="text-xl font-bold text-[var(--ink)]">
            Coût & prix
          </h1>
        </div>
        <Button variant="ghost" className="min-h-10 text-sm" onClick={logout}>
          Déconnexion
        </Button>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 bg-white/95 shadow-[0_-6px_20px_rgba(26,31,28,0.06)] backdrop-blur"
        aria-label="Navigation principale"
      >
        <div className="mx-auto flex max-w-lg px-1">
          <NavLink to="/matieres" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[var(--accent)]/45"
                    aria-hidden
                  />
                ) : null}
                <span
                  aria-hidden
                  className={isActive ? 'opacity-100' : 'opacity-70'}
                >
                  ⬤
                </span>
                Matières
              </>
            )}
          </NavLink>
          <NavLink to="/productions" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[var(--accent)]/45"
                    aria-hidden
                  />
                ) : null}
                <span
                  aria-hidden
                  className={isActive ? 'opacity-100' : 'opacity-70'}
                >
                  ◆
                </span>
                Productions
              </>
            )}
          </NavLink>
          <NavLink to="/reventes" className={linkClass}>
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[var(--accent)]/45"
                    aria-hidden
                  />
                ) : null}
                <span
                  aria-hidden
                  className={isActive ? 'opacity-100' : 'opacity-70'}
                >
                  ◇
                </span>
                Reventes
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
