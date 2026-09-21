/**
 * Calculs de coût et de prix — fonctions pures (CDC §4–7).
 */

export function sumCharges(amounts: readonly number[]): number {
  return amounts.reduce((acc, n) => acc + n, 0)
}

export function realLotCost(
  purchasePrice: number,
  chargeAmounts: readonly number[],
): number {
  if (purchasePrice < 0) throw new Error('purchasePrice must be >= 0')
  return purchasePrice + sumCharges(chargeAmounts)
}

export function unitCost(lotCost: number, quantity: number): number {
  if (quantity <= 0) throw new Error('quantity must be > 0')
  return lotCost / quantity
}

export function materialLineCost(
  materialUnitCost: number,
  quantityUsed: number,
): number {
  if (quantityUsed < 0) throw new Error('quantityUsed must be >= 0')
  return materialUnitCost * quantityUsed
}

export function productionLotCost(
  ingredientCosts: readonly number[],
  fabricationCharges: readonly number[],
): number {
  return sumCharges(ingredientCosts) + sumCharges(fabricationCharges)
}

export function suggestedPriceFromPercent(
  costPerUnit: number,
  percent: number,
): number {
  if (percent < 0) throw new Error('percent must be >= 0')
  return costPerUnit * (1 + percent / 100)
}

export function suggestedPriceFromFixed(
  costPerUnit: number,
  benefitPerUnit: number,
): number {
  if (benefitPerUnit < 0) throw new Error('benefitPerUnit must be >= 0')
  return costPerUnit + benefitPerUnit
}

export function benefitPerUnit(salePrice: number, costPerUnit: number): number {
  return salePrice - costPerUnit
}

export function lotBenefit(perUnit: number, units: number): number {
  return perUnit * units
}

export type BenefitMode = 'percent' | 'fixed_per_unit'

export function resolveSuggestedPrice(
  costPerUnit: number,
  mode: BenefitMode,
  value: number,
): number {
  return mode === 'percent'
    ? suggestedPriceFromPercent(costPerUnit, value)
    : suggestedPriceFromFixed(costPerUnit, value)
}
