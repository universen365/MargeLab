import { supabase } from '../../lib/supabase'
import type {
  BenefitMode,
  Material,
  OutputUnit,
  Production,
  ProductionCharge,
  ProductionIngredient,
} from '../../lib/database.types'
import {
  materialLineCost,
  productionLotCost,
  unitCost,
} from '../../services/costing'
import type { ChargeInput } from '../materials/materialsApi'
import { getMaterial } from '../materials/materialsApi'

export type IngredientInput = {
  materialId: string
  quantityUsed: number
}

export type ProductionDetail = Production & {
  ingredients: (ProductionIngredient & {
    materialName: string
    materialUnit: string
    lineCost: number
  })[]
  charges: ProductionCharge[]
  lotCost: number
  costPerUnit: number
}

async function loadProductionDetail(id: string): Promise<ProductionDetail | null> {
  const { data: production, error } = await supabase
    .from('productions')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!production) return null

  const [{ data: ingredients, error: iErr }, { data: charges, error: cErr }] =
    await Promise.all([
      supabase
        .from('production_ingredients')
        .select('*')
        .eq('production_id', id),
      supabase.from('production_charges').select('*').eq('production_id', id),
    ])

  if (iErr) throw iErr
  if (cErr) throw cErr

  const materialIds = (ingredients ?? []).map((i) => i.material_id)
  let materials: Material[] = []
  if (materialIds.length) {
    const { data, error: mErr } = await supabase
      .from('materials')
      .select('*')
      .in('id', materialIds)
    if (mErr) throw mErr
    materials = data ?? []
  }

  const enriched = await Promise.all(
    (ingredients ?? []).map(async (ing) => {
      const mat = materials.find((m) => m.id === ing.material_id)
      const detail = await getMaterial(ing.material_id)
      const line = materialLineCost(
        detail?.unitCostValue ?? 0,
        Number(ing.quantity_used),
      )
      return {
        ...ing,
        materialName: mat?.name ?? '?',
        materialUnit: mat?.unit ?? '',
        lineCost: line,
      }
    }),
  )

  const lot = productionLotCost(
    enriched.map((e) => e.lineCost),
    (charges ?? []).map((c) => Number(c.amount)),
  )

  return {
    ...production,
    ingredients: enriched,
    charges: charges ?? [],
    lotCost: lot,
    costPerUnit: unitCost(lot, Number(production.units_produced)),
  }
}

export async function listProductions(): Promise<ProductionDetail[]> {
  const { data, error } = await supabase
    .from('productions')
    .select('id')
    .order('created_at', { ascending: false })

  if (error) throw error
  const details: ProductionDetail[] = []
  for (const row of data ?? []) {
    const d = await loadProductionDetail(row.id)
    if (d) details.push(d)
  }
  return details
}

export async function getProduction(
  id: string,
): Promise<ProductionDetail | null> {
  return loadProductionDetail(id)
}

export async function createProduction(input: {
  name: string
  unitsProduced: number
  unitLabel: OutputUnit
  ingredients: IngredientInput[]
  charges: ChargeInput[]
}): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')

  if (!input.ingredients.length) {
    throw new Error('Ajoute au moins une matière')
  }

  for (const ing of input.ingredients) {
    const mat = await getMaterial(ing.materialId)
    if (!mat) throw new Error('Matière introuvable')
    if (Number(mat.quantity_remaining) < ing.quantityUsed) {
      throw new Error(
        `Pas assez de « ${mat.name} » (reste ${mat.quantity_remaining} ${mat.unit})`,
      )
    }
  }

  const { data, error } = await supabase
    .from('productions')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      units_produced: input.unitsProduced,
      unit_label: input.unitLabel,
    })
    .select('id')
    .single()

  if (error) throw error

  const { error: iErr } = await supabase.from('production_ingredients').insert(
    input.ingredients.map((ing) => ({
      production_id: data.id,
      material_id: ing.materialId,
      quantity_used: ing.quantityUsed,
    })),
  )
  if (iErr) throw iErr

  const validCharges = input.charges.filter(
    (c) => c.name.trim() && c.amount >= 0,
  )
  if (validCharges.length) {
    const { error: cErr } = await supabase.from('production_charges').insert(
      validCharges.map((c) => ({
        production_id: data.id,
        name: c.name.trim(),
        amount: c.amount,
      })),
    )
    if (cErr) throw cErr
  }

  for (const ing of input.ingredients) {
    const mat = await getMaterial(ing.materialId)
    if (!mat) continue
    const remaining = Number(mat.quantity_remaining) - ing.quantityUsed
    const { error: uErr } = await supabase
      .from('materials')
      .update({ quantity_remaining: remaining })
      .eq('id', ing.materialId)
    if (uErr) throw uErr
  }

  return data.id
}

export async function updateProductionPricing(
  id: string,
  input: {
    benefitMode: BenefitMode
    benefitValue: number
    currentSalePrice: number | null
  },
): Promise<void> {
  const { error } = await supabase
    .from('productions')
    .update({
      benefit_mode: input.benefitMode,
      benefit_value: input.benefitValue,
      current_sale_price: input.currentSalePrice,
    })
    .eq('id', id)

  if (error) throw error
}

export async function deleteProduction(id: string): Promise<void> {
  const detail = await loadProductionDetail(id)
  if (!detail) return

  for (const ing of detail.ingredients) {
    const mat = await getMaterial(ing.material_id)
    if (!mat) continue
    const remaining =
      Number(mat.quantity_remaining) + Number(ing.quantity_used)
    await supabase
      .from('materials')
      .update({ quantity_remaining: remaining })
      .eq('id', ing.material_id)
  }

  const { error } = await supabase.from('productions').delete().eq('id', id)
  if (error) throw error
}
