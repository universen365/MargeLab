import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  deleteProduction,
  getProduction,
  updateProductionPricing,
  type ProductionDetail,
} from '../features/productions/productionsApi'
import { formatMoney, OUTPUT_UNIT_LABELS } from '../lib/format'
import { Button } from '../components/Button'
import { PricePanel } from '../components/PricePanel'

export function ProductionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<ProductionDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reload() {
    if (!id) return
    getProduction(id)
      .then(setItem)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function onDelete() {
    if (!id || !confirm('Supprimer cette production ? (restitue les matières)'))
      return
    try {
      await deleteProduction(id)
      navigate('/productions')
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
        onClick={() => navigate('/productions')}
      >
        ← Productions
      </button>

      <div>
        <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
          Fabriqué
        </span>
        <h2 className="mt-1 text-2xl font-bold">{item.name}</h2>
        <p className="text-sm text-[var(--muted)]">
          {item.units_produced} {OUTPUT_UNIT_LABELS[item.unit_label]}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold">Composition</h3>
        <ul className="text-sm">
          {item.ingredients.map((ing) => (
            <li
              key={ing.id}
              className="flex justify-between gap-2 border-b border-[var(--line)] py-2 last:border-0"
            >
              <span>
                {ing.materialName} · {ing.quantity_used} {ing.materialUnit}
              </span>
              <span>{formatMoney(ing.lineCost)}</span>
            </li>
          ))}
          {item.charges.map((c) => (
            <li
              key={c.id}
              className="flex justify-between gap-2 border-b border-[var(--line)] py-2 last:border-0"
            >
              <span>{c.name}</span>
              <span>{formatMoney(Number(c.amount))}</span>
            </li>
          ))}
        </ul>
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
        unitsInLot={Number(item.units_produced)}
        unitWord={unitWord}
        initialMode={item.benefit_mode}
        initialValue={item.benefit_value}
        initialSalePrice={item.current_sale_price}
        onSave={async (input) => {
          await updateProductionPricing(item.id, input)
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
