import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(
  url?.startsWith('http') && anonKey && anonKey.length > 20,
)

/**
 * Client unique. Si les variables Vercel manquent, on n’explose pas au chargement
 * (page blanche) — l’UI affiche un message de config.
 */
export const supabase: SupabaseClient = createClient(
  url && url.startsWith('http') ? url : 'https://placeholder.supabase.co',
  anonKey && anonKey.length > 20 ? anonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
)
