export function MissingConfigPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          Configuration manquante
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          L’application n’a pas les clés de connexion. Sur Vercel, ajoute ces
          variables d’environnement puis redéploie :
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1 font-mono text-sm text-[var(--ink)]">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Projet Vercel → Settings → Environment Variables → Production →
          Redeploy.
        </p>
      </div>
    </div>
  )
}
