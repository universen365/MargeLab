import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquent dans .env',
  )
}

/** Client unique — les typages métier sont dans database.types + les APIs features. */
export const supabase = createClient(url, anonKey)
