import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMaterial } from '../features/materials/materialsApi'
import type { ChargeInput } from '../features/materials/materialsApi'
import type { MeasureUnit } from '../lib/database.types'
import { MEASURE_UNITS } from '../lib/format'
import { realLotCost, unitCost } from '../services/costing'
import { formatMoney } from '../lib/format'
import { Button } from '../components/Button'
import { ChargeEditor } from '../components/ChargeEditor'
import { Field, Select, TextInput } from '../components/Field'

export function NewMaterialPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [unit, setUnit] = useState<MeasureUnit>('kg')
  const [qty, setQty] = useState('1')
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
  const perUnit = qtyN > 0 ? unitCost(lot, qtyN) : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || qtyN <= 0) {
      setError('Nom et quantité obligatoires')
      return
    }
    setBusy(true)
    try {
      const id = await createMaterial({
        name,
        unit,
        quantityPurchased: qtyN,
        purchasePrice: priceN,
        charges,
      })
      navigate(`/matieres/${id}`)
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
        <h2 className="text-2xl font-bold">Nouvelle matière</h2>
      </div>

      <Field label="Nom">
        <TextInput
          required
          value={name}
          placeholder="Karité"
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
            value={unit}
            onChange={(e) => setUnit(e.target.value as MeasureUnit)}
          >
            {MEASURE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
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
        title="Charges (transport, etc.)"
        charges={charges}
        onChange={setCharges}
      />

      {qtyN > 0 ? (
        <div className="rounded-xl bg-[var(--accent-soft)] p-4 text-sm">
          <p>
            Coût réel du lot : <strong>{formatMoney(lot)}</strong>
          </p>
          <p>
            1 {unit} = <strong>{formatMoney(perUnit)}</strong>
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
