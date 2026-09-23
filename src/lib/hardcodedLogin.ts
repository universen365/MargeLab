/**
 * Login classique en dur — change ces valeurs avant de partager l’app.
 * Peut aussi être surchargé via .env (Vercel) :
 *   VITE_LOGIN_USERNAME / VITE_LOGIN_PASSWORD / VITE_LOGIN_EMAIL
 */
export const HARDCODED_LOGIN = {
  username: import.meta.env.VITE_LOGIN_USERNAME || 'margelab',
  password: import.meta.env.VITE_LOGIN_PASSWORD || 'margelab',
  /** Compte Supabase (créé auto au 1er login si Confirm email est OFF). */
  email: import.meta.env.VITE_LOGIN_EMAIL || 'margelab@app.local',
} as const

export function credentialsMatch(username: string, password: string): boolean {
  return (
    username.trim() === HARDCODED_LOGIN.username &&
    password === HARDCODED_LOGIN.password
  )
}
