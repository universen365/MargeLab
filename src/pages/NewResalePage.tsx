import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createResale } from '../features/resales/resalesApi'
import type { ChargeInput } from '../features/materials/materialsApi'
import type { OutputUnit } from '../lib/database.types'
import { OUTPUT_UNITS, OUTPUT_UNIT_LABELS, formatMoney } from '../lib/format'
import { realLotCost, unitCost } from '../services/costing'
import { Button } from '../components/Button'
import { ChargeEditor } from '../components/ChargeEditor'
import { Field, Select, TextInput } from '../components/Field'

export function NewResalePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [qty, setQty] = useState('30')
  const [unitLabel, setUnitLabel] = useState<OutputUnit>('piece')
  const [price, setPrice] = useState('')
  const [charges, setCharges] = useState<ChargeInput[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const qtyN = Number(qty) || 0
  const priceN = Number(price) || 0
  const lot =
    qtyN > 0
      ? realLotCost(
          priceN,
          charges.map((c) => c.amount),
        )
      : 0
  const per = qtyN > 0 ? unitCost(lot, qtyN) : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const id = await createResale({
        name,
        quantity: qtyN,
        unitLabel,
        purchasePrice: priceN,
        charges,
      })
      navigate(`/reventes/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <button
          type="button"
          className="mb-2 text-sm text-[var(--muted)]"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>
        <h2 className="text-2xl font-bold">Nouvelle revente</h2>
      </div>

      <Field label="Nom">
        <TextInput
          required
          value={name}
          placeholder="Accessoire"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantité achetée">
          <TextInput
            type="number"
            min={0.0001}
            step="any"
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </Field>
        <Field label="Unité">
          <Select
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value as OutputUnit)}
          >
            {OUTPUT_UNITS.map((u) => (
              <option key={u} value={u}>
                {OUTPUT_UNIT_LABELS[u]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Prix d’achat du lot (F)">
        <TextInput
          type="number"
          min={0}
          step="1"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Field>

      <ChargeEditor
        title="Charges (transport, douane…)"
        charges={charges}
        onChange={setCharges}
      />

      {qtyN > 0 ? (
        <div className="rounded-xl bg-[var(--accent-soft)] p-4 text-sm">
          <p>
            Coût réel : <strong>{formatMoney(lot)}</strong>
          </p>
          <p>
            Coût d’une unité : <strong>{formatMoney(per)}</strong>
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  )
}
