import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listMaterials,
  type MaterialDetail,
} from '../features/materials/materialsApi'
import {
  createProduction,
  type IngredientInput,
} from '../features/productions/productionsApi'
import type { ChargeInput } from '../features/materials/materialsApi'
import type { OutputUnit } from '../lib/database.types'
import { OUTPUT_UNITS, OUTPUT_UNIT_LABELS, formatMoney } from '../lib/format'
import { materialLineCost, productionLotCost, unitCost } from '../services/costing'
import { Button } from '../components/Button'
import { ChargeEditor } from '../components/ChargeEditor'
import { Field, Select, TextInput } from '../components/Field'

type IngRow = IngredientInput & { key: string }

export function NewProductionPage() {
  const navigate = useNavigate()
  const [materials, setMaterials] = useState<MaterialDetail[]>([])
  const [name, setName] = useState('')
  const [units, setUnits] = useState('20')
  const [unitLabel, setUnitLabel] = useState<OutputUnit>('pot')
  const [ingredients, setIngredients] = useState<IngRow[]>([])
  const [charges, setCharges] = useState<ChargeInput[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    listMaterials()
      .then(setMaterials)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur'))
  }, [])

  const unitsN = Number(units) || 0

  const lineCosts = ingredients.map((ing) => {
    const mat = materials.find((m) => m.id === ing.materialId)
    if (!mat || !ing.quantityUsed) return 0
    return materialLineCost(mat.unitCostValue, ing.quantityUsed)
  })
  const lot =
    unitsN > 0
      ? productionLotCost(
          lineCosts,
          charges.map((c) => c.amount),
        )
      : 0
  const per = unitsN > 0 ? unitCost(lot, unitsN) : 0

  function addIngredient() {
    const first = materials[0]
    if (!first) {
      setError('Ajoute d’abord une matière')
      return
    }
    setIngredients((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        materialId: first.id,
        quantityUsed: 0,
      },
    ])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const id = await createProduction({
        name,
        unitsProduced: unitsN,
        unitLabel,
        ingredients: ingredients.map(({ materialId, quantityUsed }) => ({
          materialId,
          quantityUsed,
        })),
        charges,
      })
      navigate(`/productions/${id}`)
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
        <h2 className="text-2xl font-bold">Nouvelle production</h2>
      </div>

      <Field label="Nom du lot">
        <TextInput
          required
          value={name}
          placeholder="Crème capillaire"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Unités produites">
          <TextInput
            type="number"
            min={0.0001}
            step="any"
            required
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
        </Field>
        <Field label="Type">
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Matières utilisées</h3>
          <Button
            variant="secondary"
            className="min-h-10 px-3 text-sm"
            onClick={addIngredient}
          >
            + Matière
          </Button>
        </div>

        {ingredients.map((ing, i) => {
          const mat = materials.find((m) => m.id === ing.materialId)
          return (
            <div
              key={ing.key}
              className="grid gap-2 rounded-xl border border-[var(--line)] bg-white p-3"
            >
              <Field label="Matière">
                <Select
                  value={ing.materialId}
                  onChange={(e) =>
                    setIngredients((prev) =>
                      prev.map((row, idx) =>
                        idx === i
                          ? { ...row, materialId: e.target.value }
                          : row,
                      ),
                    )
                  }
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (reste {m.quantity_remaining} {m.unit})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label={`Quantité utilisée (${mat?.unit ?? ''})`}
              >
                <TextInput
                  type="number"
                  min={0}
                  step="any"
                  value={ing.quantityUsed || ''}
                  onChange={(e) =>
                    setIngredients((prev) =>
                      prev.map((row, idx) =>
                        idx === i
                          ? {
                              ...row,
                              quantityUsed: Number(e.target.value) || 0,
                            }
                          : row,
                      ),
                    )
                  }
                />
              </Field>
              <Button
                variant="ghost"
                className="self-start text-sm"
                onClick={() =>
                  setIngredients((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                Retirer
              </Button>
            </div>
          )
        })}
      </div>

      <ChargeEditor
        title="Charges de fabrication"
        charges={charges}
        onChange={setCharges}
      />

      {unitsN > 0 && ingredients.length > 0 ? (
        <div className="rounded-xl bg-[var(--accent-soft)] p-4 text-sm">
          <p>
            Coût du lot : <strong>{formatMoney(lot)}</strong>
          </p>
          <p>
            Coût d’un {OUTPUT_UNIT_LABELS[unitLabel].replace(/\(s\)/, '')} :{' '}
            <strong>{formatMoney(per)}</strong>
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Enregistrement…' : 'Enregistrer la production'}
      </Button>
    </form>
  )
}
