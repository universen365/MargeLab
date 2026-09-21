import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listResales,
  type ResaleDetail,
} from '../features/resales/resalesApi'
import { formatMoney, OUTPUT_UNIT_LABELS } from '../lib/format'
import { Button } from '../components/Button'

export function ResalesPage() {
  const [items, setItems] = useState<ResaleDetail[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listResales()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Reventes</h2>
          <p className="text-sm text-[var(--muted)]">
            Articles achetés pour revendre.
          </p>
        </div>
        <Link to="/reventes/nouvelle">
          <Button className="whitespace-nowrap">+ Ajouter</Button>
        </Link>
      </div>

      {loading ? <p className="text-[var(--muted)]">Chargement…</p> : null}
      {error ? <p className="text-[var(--danger)]">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-[var(--muted)]">
          Aucune revente pour l’instant.
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {items.map((r) => (
          <li key={r.id}>
            <Link
              to={`/reventes/${r.id}`}
              className="block rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
                    Acheté
                  </span>
                  <p className="mt-1 font-semibold">{r.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {r.quantity} {OUTPUT_UNIT_LABELS[r.unit_label]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--muted)]">Coût / unité</p>
                  <p className="font-bold text-[var(--accent)]">
                    {formatMoney(r.costPerUnit)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
