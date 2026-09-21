import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthProvider'
import { Button } from '../components/Button'
import { Field, PasswordInput, TextInput } from '../components/Field'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) {
    return <Navigate to="/matieres" replace />
  }

  function goToSignup() {
    setMode('signup')
    setError(null)
    setInfo(null)
    setConfirmPassword('')
  }

  function goToLogin() {
    setMode('login')
    setError(null)
    setInfo(null)
    setConfirmPassword('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (err) throw err
        navigate('/matieres')
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (err) throw err
        if (data.session) {
          navigate('/matieres')
        } else {
          setInfo(
            'Compte créé. Vérifie ta boîte mail et ouvre le lien reçu, puis reconnecte-toi.',
          )
        }
      }
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
            ? 'Entre ton email et ton mot de passe.'
            : 'Email, mot de passe, puis confirmation.'}
        </p>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
      >
        <Field label="Email">
          <TextInput
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="toi@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        {info ? <p className="text-sm text-[var(--accent)]">{info}</p> : null}

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
