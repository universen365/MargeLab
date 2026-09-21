import { describe, expect, it } from 'vitest'
import {
  benefitPerUnit,
  lotBenefit,
  materialLineCost,
  productionLotCost,
  realLotCost,
  resolveSuggestedPrice,
  suggestedPriceFromFixed,
  suggestedPriceFromPercent,
  unitCost,
} from './costing'

describe('realLotCost', () => {
  it('ajoute prix d’achat et charges', () => {
    expect(realLotCost(25_000, [2_000, 500])).toBe(27_500)
  })

  it('refuse un prix négatif', () => {
    expect(() => realLotCost(-1, [])).toThrow()
  })
})

describe('unitCost', () => {
  it('divise le lot', () => {
    expect(unitCost(27_000, 5)).toBe(5_400)
  })

  it('refuse quantité nulle', () => {
    expect(() => unitCost(100, 0)).toThrow()
  })
})

describe('productionLotCost', () => {
  it('somme matières + charges fabrication', () => {
    expect(productionLotCost([50_000, 1_000], [5_000, 2_000])).toBe(58_000)
  })
})

describe('materialLineCost', () => {
  it('quantité × coût unitaire', () => {
    expect(materialLineCost(5.4, 100)).toBeCloseTo(540)
  })
})

describe('prix suggéré', () => {
  it('+40 % sur 2850', () => {
    expect(suggestedPriceFromPercent(2_850, 40)).toBeCloseTo(3_990)
  })

  it('+1000 F par pot', () => {
    expect(suggestedPriceFromFixed(2_850, 1_000)).toBe(3_850)
  })

  it('resolveSuggestedPrice', () => {
    expect(resolveSuggestedPrice(2_850, 'percent', 40)).toBeCloseTo(3_990)
    expect(resolveSuggestedPrice(2_850, 'fixed_per_unit', 1_000)).toBe(3_850)
  })
})

describe('bénéfice', () => {
  it('par unité et sur le lot', () => {
    expect(benefitPerUnit(4_000, 2_600)).toBe(1_400)
    expect(lotBenefit(1_000, 20)).toBe(20_000)
  })
})
