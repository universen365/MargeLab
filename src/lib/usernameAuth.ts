/**
 * Auth par identifiant (pas d’email visible).
 * Supabase exige un email en interne → on dérive une adresse technique.
 */
export function usernameToAuthEmail(username: string): string {
  const slug = username
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 48)

  if (!slug) {
    throw new Error('Identifiant invalide.')
  }

  return `${slug}@margelab.app`
}

export function isValidUsername(username: string): boolean {
  const t = username.trim()
  return t.length >= 3 && t.length <= 32
}
