import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listProductions,
  type ProductionDetail,
} from '../features/productions/productionsApi'
import { formatMoney, OUTPUT_UNIT_LABELS } from '../lib/format'
import { Button } from '../components/Button'

export function ProductionsPage() {
  const [items, setItems] = useState<ProductionDetail[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProductions()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Productions</h2>
          <p className="text-sm text-[var(--muted)]">
            Lots fabriqués — coût d’un pot ou d’une bouteille.
          </p>
        </div>
        <Link to="/productions/nouvelle">
          <Button className="whitespace-nowrap">+ Ajouter</Button>
        </Link>
      </div>

      {loading ? <p className="text-[var(--muted)]">Chargement…</p> : null}
      {error ? <p className="text-[var(--danger)]">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-[var(--muted)]">
          Ajoute d’abord des matières, puis crée une production.
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              to={`/productions/${p.id}`}
              className="block rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between gap-2">
                <div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    Fabriqué
                  </span>
                  <p className="mt-1 font-semibold">{p.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {p.units_produced} {OUTPUT_UNIT_LABELS[p.unit_label]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--muted)]">Coût / unité</p>
                  <p className="font-bold text-[var(--accent)]">
                    {formatMoney(p.costPerUnit)}
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
