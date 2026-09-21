import {
  benefitPerUnit,
  lotBenefit,
  resolveSuggestedPrice,
  type BenefitMode,
} from '../services/costing'
import { formatMoney } from '../lib/format'
import { Button } from './Button'
import { Field, TextInput, Select } from './Field'
import { useState } from 'react'

type Props = {
  costPerUnit: number
  unitsInLot: number
  unitWord: string
  initialMode?: BenefitMode | null
  initialValue?: number | null
  initialSalePrice?: number | null
  onSave: (input: {
    benefitMode: BenefitMode
    benefitValue: number
    currentSalePrice: number | null
  }) => Promise<void>
}

export function PricePanel({
  costPerUnit,
  unitsInLot,
  unitWord,
  initialMode,
  initialValue,
  initialSalePrice,
  onSave,
}: Props) {
  const [mode, setMode] = useState<BenefitMode>(initialMode ?? 'percent')
  const [value, setValue] = useState(
    initialValue != null ? String(initialValue) : '40',
  )
  const [salePrice, setSalePrice] = useState(
    initialSalePrice != null ? String(initialSalePrice) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const numValue = Number(value) || 0
  const suggested = resolveSuggestedPrice(costPerUnit, mode, numValue)
  const perUnit = benefitPerUnit(suggested, costPerUnit)
  const onLot = lotBenefit(perUnit, unitsInLot)

  const current = salePrice === '' ? null : Number(salePrice)
  const currentBenefit =
    current != null && Number.isFinite(current)
      ? benefitPerUnit(current, costPerUnit)
      : null

  async function handleSave() {
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      await onSave({
        benefitMode: mode,
        benefitValue: numValue,
        currentSalePrice: current,
      })
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Fixer le prix</h2>
      <p className="text-sm text-[var(--muted)]">
        Coût d’un {unitWord} :{' '}
        <strong className="text-[var(--ink)]">{formatMoney(costPerUnit)}</strong>
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Je veux gagner">
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value as BenefitMode)}
          >
            <option value="percent">En % sur le coût</option>
            <option value="fixed_per_unit">En francs par {unitWord}</option>
          </Select>
        </Field>
        <Field
          label={mode === 'percent' ? 'Pourcentage' : `Bénéfice / ${unitWord}`}
        >
          <TextInput
            type="number"
            min={0}
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
      </div>

      <div className="rounded-xl bg-[var(--accent-soft)] p-4">
        <p className="text-sm text-[var(--accent)]">Prix suggéré</p>
        <p className="text-3xl font-bold tracking-tight text-[var(--accent)]">
          {formatMoney(suggested)}
        </p>
        <p className="mt-2 text-sm text-[var(--ink)]">
          Tu gagnes {formatMoney(perUnit)} par {unitWord}.
          <br />
          Sur ce lot ({unitsInLot}) :{' '}
          <strong>{formatMoney(onLot)}</strong>.
        </p>
      </div>

      <Field
        label={`Prix actuel (optionnel)`}
        hint="Pour voir si tu gagnes ou tu perds déjà"
      >
        <TextInput
          type="number"
          min={0}
          step="1"
          placeholder="Ex. 4000"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />
      </Field>

      {currentBenefit != null ? (
        <p
          className={`text-sm font-medium ${
            currentBenefit < 0 ? 'text-[var(--danger)]' : 'text-[var(--accent)]'
          }`}
        >
          {currentBenefit < 0
            ? `Tu perds ${formatMoney(Math.abs(currentBenefit))} par ${unitWord}.`
            : `Avec ce prix, tu gagnes ${formatMoney(currentBenefit)} par ${unitWord}.`}
        </p>
      ) : null}

      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {saved ? (
        <p className="text-sm text-[var(--accent)]">Objectif enregistré.</p>
      ) : null}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer l’objectif'}
      </Button>
    </section>
  )
}
