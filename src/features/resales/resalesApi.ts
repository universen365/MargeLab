import { supabase } from '../../lib/supabase'
import type {
  BenefitMode,
  OutputUnit,
  Resale,
  ResaleCharge,
} from '../../lib/database.types'
import { realLotCost, unitCost } from '../../services/costing'
import type { ChargeInput } from '../materials/materialsApi'

export type ResaleDetail = Resale & {
  charges: ResaleCharge[]
  lotCost: number
  costPerUnit: number
}

function enrich(resale: Resale, charges: ResaleCharge[]): ResaleDetail {
  const lot = realLotCost(
    Number(resale.purchase_price),
    charges.map((c) => Number(c.amount)),
  )
  return {
    ...resale,
    charges,
    lotCost: lot,
    costPerUnit: unitCost(lot, Number(resale.quantity)),
  }
}

export async function listResales(): Promise<ResaleDetail[]> {
  const { data: resales, error } = await supabase
    .from('resales')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!resales?.length) return []

  const ids = resales.map((r) => r.id)
  const { data: charges, error: cErr } = await supabase
    .from('resale_charges')
    .select('*')
    .in('resale_id', ids)

  if (cErr) throw cErr

  return resales.map((r) =>
    enrich(
      r,
      (charges ?? []).filter((c) => c.resale_id === r.id),
    ),
  )
}

export async function getResale(id: string): Promise<ResaleDetail | null> {
  const { data: resale, error } = await supabase
    .from('resales')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!resale) return null

  const { data: charges, error: cErr } = await supabase
    .from('resale_charges')
    .select('*')
    .eq('resale_id', id)

  if (cErr) throw cErr
  return enrich(resale, charges ?? [])
}

export async function createResale(input: {
  name: string
  quantity: number
  unitLabel: OutputUnit
  purchasePrice: number
  charges: ChargeInput[]
}): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connecté')

  const { data, error } = await supabase
    .from('resales')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      quantity: input.quantity,
      unit_label: input.unitLabel,
      purchase_price: input.purchasePrice,
    })
    .select('id')
    .single()

  if (error) throw error

  const validCharges = input.charges.filter(
    (c) => c.name.trim() && c.amount >= 0,
  )
  if (validCharges.length) {
    const { error: cErr } = await supabase.from('resale_charges').insert(
      validCharges.map((c) => ({
        resale_id: data.id,
        name: c.name.trim(),
        amount: c.amount,
      })),
    )
    if (cErr) throw cErr
  }

  return data.id
}

export async function updateResalePricing(
  id: string,
  input: {
    benefitMode: BenefitMode
    benefitValue: number
    currentSalePrice: number | null
  },
): Promise<void> {
  const { error } = await supabase
    .from('resales')
    .update({
      benefit_mode: input.benefitMode,
      benefit_value: input.benefitValue,
      current_sale_price: input.currentSalePrice,
    })
    .eq('id', id)

  if (error) throw error
}

export async function deleteResale(id: string): Promise<void> {
  const { error } = await supabase.from('resales').delete().eq('id', id)
  if (error) throw error
}
