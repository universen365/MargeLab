import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteResale,
  getResale,
  updateResalePricing,
  type ResaleDetail,
} from '../features/resales/resalesApi'
import { formatMoney, OUTPUT_UNIT_LABELS } from '../lib/format'
import { Button } from '../components/Button'
import { PricePanel } from '../components/PricePanel'

export function ResaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<ResaleDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reload() {
    if (!id) return
    getResale(id)
      .then(setItem)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function onDelete() {
    if (!id || !confirm('Supprimer cette revente ?')) return
    try {
      await deleteResale(id)
      navigate('/reventes')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    }
  }

  if (!item) {
    return (
      <p className={error ? 'text-[var(--danger)]' : 'text-[var(--muted)]'}>
        {error ?? 'Chargement…'}
      </p>
    )
  }

  const unitWord = OUTPUT_UNIT_LABELS[item.unit_label].replace(/\(s\)/, '')

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="self-start text-sm text-[var(--muted)]"
        onClick={() => navigate('/reventes')}
      >
        ← Reventes
      </button>

      <div>
        <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
          Acheté
        </span>
        <h2 className="mt-1 text-2xl font-bold">{item.name}</h2>
        <p className="text-sm text-[var(--muted)]">
          {item.quantity} {OUTPUT_UNIT_LABELS[item.unit_label]}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--muted)]">Prix d’achat</dt>
            <dd>{formatMoney(Number(item.purchase_price))}</dd>
          </div>
          {item.charges.map((c) => (
            <div key={c.id} className="flex justify-between">
              <dt className="text-[var(--muted)]">{c.name}</dt>
              <dd>{formatMoney(Number(c.amount))}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 rounded-xl bg-[var(--accent-soft)] p-3">
          <p className="text-sm">Coût du lot : {formatMoney(item.lotCost)}</p>
          <p className="text-2xl font-bold text-[var(--accent)]">
            {formatMoney(item.costPerUnit)}
            <span className="text-base font-medium"> / {unitWord}</span>
          </p>
        </div>
      </div>

      <PricePanel
        costPerUnit={item.costPerUnit}
        unitsInLot={Number(item.quantity)}
        unitWord={unitWord}
        initialMode={item.benefit_mode}
        initialValue={item.benefit_value}
        initialSalePrice={item.current_sale_price}
        onSave={async (input) => {
          await updateResalePricing(item.id, input)
          reload()
        }}
      />

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <Button variant="danger" onClick={onDelete}>
        Supprimer
      </Button>
    </div>
  )
}
