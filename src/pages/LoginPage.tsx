import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthProvider'
import { Button } from '../components/Button'
import { Field, PasswordInput, TextInput } from '../components/Field'

type Mode = 'login' | 'signup' | 'otp'

const SUCCESS_CONFIRM =
  'Compte créé avec succès. Tu peux te connecter.'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [handlingConfirm, setHandlingConfirm] = useState(
    () => searchParams.get('confirmed') === '1',
  )

  useEffect(() => {
    if (searchParams.get('confirmed') !== '1') return

    let cancelled = false

    async function finishConfirmation() {
      try {
        await new Promise((r) => setTimeout(r, 150))
        await supabase.auth.getSession()
        await supabase.auth.signOut()
      } finally {
        if (!cancelled) {
          setSuccess(SUCCESS_CONFIRM)
          setMode('login')
          setHandlingConfirm(false)
          navigate('/login', { replace: true })
        }
      }
    }

    void finishConfirmation()
    return () => {
      cancelled = true
    }
  }, [searchParams, navigate])

  if (!loading && session && !handlingConfirm && mode !== 'otp') {
    return <Navigate to="/matieres" replace />
  }

  function clearMessages() {
    setError(null)
    setInfo(null)
    setSuccess(null)
  }

  function goToSignup() {
    setMode('signup')
    clearMessages()
    setConfirmPassword('')
    setOtp('')
  }

  function goToLogin() {
    setMode('login')
    clearMessages()
    setConfirmPassword('')
    setOtp('')
  }

  async function submitLoginOrSignup(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()

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
          setMode('otp')
          setOtp('')
          setInfo(
            'Un code à 6 chiffres a été envoyé à ton adresse mail. Entre-le ci-dessous.',
          )
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()

    const token = otp.replace(/\s/g, '')
    if (!/^\d{6}$/.test(token)) {
      setError('Entre le code à 6 chiffres reçu par mail.')
      return
    }

    setBusy(true)
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'signup',
      })
      if (err) throw err

      await supabase.auth.signOut()
      setMode('login')
      setPassword('')
      setConfirmPassword('')
      setOtp('')
      setSuccess(SUCCESS_CONFIRM)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide ou expiré')
    } finally {
      setBusy(false)
    }
  }

  async function resendOtp() {
    clearMessages()
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (err) throw err
      setInfo('Un nouveau code a été envoyé. Vérifie ta boîte mail.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de renvoyer')
    } finally {
      setBusy(false)
    }
  }

  if (handlingConfirm) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8 text-center text-[var(--muted)]">
        Confirmation en cours…
      </div>
    )
  }

  const title =
    mode === 'login'
      ? 'Connexion'
      : mode === 'signup'
        ? 'Créer un compte'
        : 'Code de confirmation'

  const subtitle =
    mode === 'login'
      ? 'Entre ton email et ton mot de passe.'
      : mode === 'signup'
        ? 'Email, mot de passe, puis confirmation.'
        : `Code envoyé à ${email.trim() || 'ton adresse mail'}.`

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          MargeLab
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>

      {mode === 'otp' ? (
        <form
          onSubmit={submitOtp}
          className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
        >
          <Field label="Code à 6 chiffres" hint="Regarde ton mail (et les spams)">
            <TextInput
              type="text"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="tracking-[0.35em] text-center text-lg font-semibold"
            />
          </Field>

          {error ? (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}
          {info ? <p className="text-sm text-[var(--accent)]">{info}</p> : null}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? '…' : 'Valider le code'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            className="w-full"
            onClick={() => void resendOtp()}
          >
            Renvoyer le code
          </Button>

          <p className="text-center text-sm text-[var(--muted)]">
            <button
              type="button"
              className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
              onClick={goToLogin}
            >
              Retour à la connexion
            </button>
          </p>
        </form>
      ) : (
        <form
          onSubmit={submitLoginOrSignup}
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
      )}
    </div>
  )
}
