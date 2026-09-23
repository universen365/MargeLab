/** URL de retour après confirmation email (doit être dans Redirect URLs Supabase). */
export function authEmailRedirectTo(): string {
  return `${window.location.origin}/login?confirmed=1`
}
