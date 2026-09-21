import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteMaterial,
  getMaterial,
  type MaterialDetail,
} from '../features/materials/materialsApi'
import { formatMoney, formatQty } from '../lib/format'
import { Button } from '../components/Button'

export function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<MaterialDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    getMaterial(id)
      .then(setItem)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
  }, [id])

  async function onDelete() {
    if (!id || !confirm('Supprimer cette matière ?')) return
    setBusy(true)
    try {
      await deleteMaterial(id)
      navigate('/matieres')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      setBusy(false)
    }
  }

  if (error && !item) {
    return <p className="text-[var(--danger)]">{error}</p>
  }

  if (!item) {
    return <p className="text-[var(--muted)]">Chargement…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="self-start text-sm text-[var(--muted)]"
        onClick={() => navigate('/matieres')}
      >
        ← Matières
      </button>

      <h2 className="text-2xl font-bold">{item.name}</h2>

      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Acheté</dt>
            <dd className="font-medium">
              {formatQty(Number(item.quantity_purchased), item.unit)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Reste</dt>
            <dd className="font-medium">
              {formatQty(Number(item.quantity_remaining), item.unit)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Prix d’achat</dt>
            <dd className="font-medium">
              {formatMoney(Number(item.purchase_price))}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">Charges</dt>
            <dd className="font-medium">{formatMoney(item.chargesTotal)}</dd>
          </div>
        </dl>

        {item.charges.length > 0 ? (
          <ul className="mt-3 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)]">
            {item.charges.map((c) => (
              <li key={c.id} className="flex justify-between py-1">
                <span>{c.name}</span>
                <span>{formatMoney(Number(c.amount))}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 rounded-xl bg-[var(--accent-soft)] p-3">
          <p className="text-sm text-[var(--accent)]">Coût réel du lot</p>
          <p className="text-2xl font-bold text-[var(--accent)]">
            {formatMoney(item.realLotCost)}
          </p>
          <p className="mt-1 text-sm">
            1 {item.unit} = <strong>{formatMoney(item.unitCostValue)}</strong>
          </p>
        </div>
      </div>

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <Button variant="danger" disabled={busy} onClick={onDelete}>
        Supprimer
      </Button>
    </div>
  )
}
