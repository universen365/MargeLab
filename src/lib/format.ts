/** Montants en francs (affichage). */
export function formatMoney(amount: number): string {
  const rounded = Math.round(amount)
  return `${rounded.toLocaleString('fr-FR')} F`
}

export function formatQty(qty: number, unit: string): string {
  const n = Number.isInteger(qty) ? qty.toString() : qty.toLocaleString('fr-FR', {
    maximumFractionDigits: 4,
  })
  return `${n} ${unit}`
}

export const MEASURE_UNITS = ['g', 'kg', 'ml', 'L', 'piece'] as const
export const OUTPUT_UNITS = ['pot', 'bottle', 'piece', 'box', 'other'] as const

export const OUTPUT_UNIT_LABELS: Record<(typeof OUTPUT_UNITS)[number], string> = {
  pot: 'pot(s)',
  bottle: 'bouteille(s)',
  piece: 'pièce(s)',
  box: 'boîte(s)',
  other: 'unité(s)',
}
