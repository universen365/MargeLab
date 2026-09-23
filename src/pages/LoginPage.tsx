import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isValidUsername, usernameToAuthEmail } from '../lib/usernameAuth'
import { useAuth } from '../features/auth/AuthProvider'
import { Button } from '../components/Button'
import { Field, PasswordInput, TextInput } from '../components/Field'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) {
    return <Navigate to="/matieres" replace />
  }

  function goToSignup() {
    setMode('signup')
    setError(null)
    setSuccess(null)
    setConfirmPassword('')
  }

  function goToLogin() {
    setMode('login')
    setError(null)
    setSuccess(null)
    setConfirmPassword('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isValidUsername(username)) {
      setError('Identifiant : 3 à 32 caractères.')
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (password.length < 6) {
      setError('Mot de passe : au moins 6 caractères.')
      return
    }

    setBusy(true)
    try {
      const email = usernameToAuthEmail(username)

      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (err) {
          throw new Error('Identifiant ou mot de passe incorrect.')
        }
        navigate('/matieres')
        return
      }

      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() },
        },
      })
      if (err) throw err

      const identities = data.user?.identities ?? []
      if (data.user && identities.length === 0) {
        setError(
          'Cet identifiant est déjà pris. Connecte-toi ou choisis-en un autre.',
        )
        setMode('login')
        return
      }

      // Pas d’accès auto : on déconnecte et on demande une vraie connexion
      if (data.session) {
        await supabase.auth.signOut()
      }

      setPassword('')
      setConfirmPassword('')
      setMode('login')
      setSuccess('Compte créé avec succès. Connecte-toi avec ton identifiant et ton mot de passe.')
      return
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
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
        <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">
          {mode === 'login' ? 'Connexion' : 'Créer un compte'}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {mode === 'login'
            ? 'Identifiant et mot de passe.'
            : 'Identifiant, mot de passe, puis confirmation.'}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
      >
        {success ? (
          <p
            className="rounded-xl bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-800"
            role="status"
          >
            {success}
          </p>
        ) : null}

        <Field label="Identifiant">
          <TextInput
            type="text"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={32}
            placeholder="ex. dijaGlamour123..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Field
          label="Mot de passe"
          hint={mode === 'signup' ? 'Au moins 6 caractères' : undefined}
        >
          <PasswordInput
            name="password"
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            required
            minLength={6}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {mode === 'signup' ? (
          <Field label="Confirmer le mot de passe">
            <PasswordInput
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
        ) : null}

        {error ? (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="w-full">
          {busy
            ? '…'
            : mode === 'login'
              ? 'Se connecter'
              : 'Créer mon compte'}
        </Button>

        {mode === 'login' ? (
          <p className="text-center text-sm text-[var(--muted)]">
            Pas encore de compte ?{' '}
            <button
              type="button"
              className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
              onClick={goToSignup}
            >
              Créer un compte
            </button>
          </p>
        ) : (
          <p className="text-center text-sm text-[var(--muted)]">
            Déjà un compte ?{' '}
            <button
              type="button"
              className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
              onClick={goToLogin}
            >
              Se connecter
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
