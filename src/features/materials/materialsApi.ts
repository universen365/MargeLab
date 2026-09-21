import { supabase } from '../../lib/supabase'
import type { Material, MaterialCharge, MeasureUnit } from '../../lib/database.types'
import { realLotCost, unitCost } from '../../services/costing'

export type ChargeInput = { name: string; amount: number }

export type MaterialDetail = Material & {
  charges: MaterialCharge[]
  chargesTotal: number
  realLotCost: number
  unitCostValue: number
}

function enrich(material: Material, charges: MaterialCharge[]): MaterialDetail {
  const amounts = charges.map((c) => Number(c.amount))
  const lot = realLotCost(Number(material.purchase_price), amounts)
  return {
    ...material,
    charges,
    chargesTotal: amounts.reduce((a, b) => a + b, 0),
    realLotCost: lot,
    unitCostValue: unitCost(lot, Number(material.quantity_purchased)),
  }
}

export async function listMaterials(): Promise<MaterialDetail[]> {
  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!materials?.length) return []

  const ids = materials.map((m) => m.id)
  const { data: charges, error: cErr } = await supabase
    .from('material_charges')
    .select('*')
    .in('material_id', ids)

  if (cErr) throw cErr

  return materials.map((m) =>
    enrich(
      m,
      (charges ?? []).filter((c) => c.material_id === m.id),
    ),
  )
}

export async function getMaterial(id: string): Promise<MaterialDetail | null> {
  const { data: material, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!material) return null

  const { data: charges, error: cErr } = await supabase
    .from('material_charges')
    .select('*')
    .eq('material_id', id)

  if (cErr) throw cErr
  return enrich(material, charges ?? [])
}

export async function createMaterial(input: {
  name: string
  unit: MeasureUnit
  quantityPurchased: number
  purchasePrice: number
  charges: ChargeInput[]
}): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')

  const { data, error } = await supabase
    .from('materials')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      unit: input.unit,
      quantity_purchased: input.quantityPurchased,
      quantity_remaining: input.quantityPurchased,
      purchase_price: input.purchasePrice,
    })
    .select('id')
    .single()

  if (error) throw error

  const validCharges = input.charges.filter(
    (c) => c.name.trim() && c.amount >= 0,
  )
  if (validCharges.length) {
    const { error: cErr } = await supabase.from('material_charges').insert(
      validCharges.map((c) => ({
        material_id: data.id,
        name: c.name.trim(),
        amount: c.amount,
      })),
    )
    if (cErr) throw cErr
  }

  return data.id
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}
