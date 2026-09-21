import { Button } from './Button'
import { Field, TextInput } from './Field'
import type { ChargeInput } from '../features/materials/materialsApi'

type Props = {
  charges: ChargeInput[]
  onChange: (next: ChargeInput[]) => void
  title?: string
}

export function ChargeEditor({
  charges,
  onChange,
  title = 'Charges',
}: Props) {
  function update(index: number, patch: Partial<ChargeInput>) {
    onChange(
      charges.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    )
  }

  function remove(index: number) {
    onChange(charges.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--ink)]">{title}</h3>
        <Button
          variant="secondary"
          className="min-h-10 px-3 text-sm"
          onClick={() => onChange([...charges, { name: '', amount: 0 }])}
        >
          + Ajouter
        </Button>
      </div>
      {charges.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Ex. transport, douane, main-d’œuvre…
        </p>
      ) : null}
      {charges.map((c, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_7rem_auto] gap-2 rounded-xl border border-[var(--line)] bg-white p-2"
        >
          <Field label="Nom">
            <TextInput
              value={c.name}
              placeholder="Transport"
              onChange={(e) => update(i, { name: e.target.value })}
            />
          </Field>
          <Field label="Montant">
            <TextInput
              type="number"
              min={0}
              step="1"
              value={Number.isFinite(c.amount) ? c.amount : 0}
              onChange={(e) =>
                update(i, { amount: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <div className="flex items-end pb-0.5">
            <Button variant="ghost" className="min-h-11 px-2" onClick={() => remove(i)}>
              ✕
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
