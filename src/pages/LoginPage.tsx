import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { credentialsMatch, HARDCODED_LOGIN } from '../lib/hardcodedLogin'
import { useAuth } from '../features/auth/AuthProvider'
import { Button } from '../components/Button'
import { Field, PasswordInput, TextInput } from '../components/Field'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) {
    return <Navigate to="/matieres" replace />
  }

  async function ensureSupabaseSession() {
    const { email, password: pwd } = HARDCODED_LOGIN

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    })

    if (!signInError) return

    // Premier lancement : crée le compte technique (Confirm email doit être OFF)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: pwd,
    })
    if (signUpError) throw signUpError

    if (data.session) return

    const { error: retryError } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    })
    if (retryError) {
      throw new Error(
        'Compte créé mais non confirmé. Dans Supabase : Authentication → Providers → Email → désactive « Confirm email ».',
      )
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!credentialsMatch(username, password)) {
      setError('Identifiant ou mot de passe incorrect.')
      return
    }

    setBusy(true)
    try {
      await ensureSupabaseSession()
      navigate('/matieres')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          MargeLab
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">Connexion</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Entre ton identifiant et ton mot de passe.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
      >
        <Field label="Identifiant">
          <TextInput
            type="text"
            name="username"
            autoComplete="username"
            required
            placeholder="Identifiant"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Field label="Mot de passe">
          <PasswordInput
            name="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error ? (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? '…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  )
}
