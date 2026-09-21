import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listMaterials,
  type MaterialDetail,
} from '../features/materials/materialsApi'
import { formatMoney, formatQty } from '../lib/format'
import { Button } from '../components/Button'

export function MaterialsPage() {
  const [items, setItems] = useState<MaterialDetail[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listMaterials()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Matières</h2>
          <p className="text-sm text-[var(--muted)]">
            Ce que tu as acheté, charges comprises.
          </p>
        </div>
        <Link to="/matieres/nouvelle">
          <Button className="whitespace-nowrap">+ Ajouter</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--muted)]">Chargement…</p>
      ) : null}
      {error ? <p className="text-[var(--danger)]">{error}</p> : null}

      {!loading && items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white/70 p-6 text-center text-[var(--muted)]">
          Commence par ajouter une matière (huile, karité, flacon…).
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {items.map((m) => (
          <li key={m.id}>
            <Link
              to={`/matieres/${m.id}`}
              className="block rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm transition hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    Reste {formatQty(Number(m.quantity_remaining), m.unit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--muted)]">1 {m.unit}</p>
                  <p className="font-bold text-[var(--accent)]">
                    {formatMoney(m.unitCostValue)}
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
