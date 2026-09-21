export type MeasureUnit = 'g' | 'kg' | 'ml' | 'L' | 'piece'
export type OutputUnit = 'pot' | 'bottle' | 'piece' | 'box' | 'other'
export type BenefitMode = 'percent' | 'fixed_per_unit'

export type Database = {
  public: {
    Tables: {
      materials: {
        Row: {
          id: string
          user_id: string
          name: string
          unit: MeasureUnit
          quantity_purchased: number
          quantity_remaining: number
          purchase_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          unit: MeasureUnit
          quantity_purchased: number
          quantity_remaining: number
          purchase_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          unit?: MeasureUnit
          quantity_purchased?: number
          quantity_remaining?: number
          purchase_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      material_charges: {
        Row: {
          id: string
          material_id: string
          name: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          material_id: string
          name: string
          amount: number
          created_at?: string
        }
        Update: {
          name?: string
          amount?: number
        }
        Relationships: []
      }
      productions: {
        Row: {
          id: string
          user_id: string
          name: string
          units_produced: number
          unit_label: OutputUnit
          benefit_mode: BenefitMode | null
          benefit_value: number | null
          current_sale_price: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          units_produced: number
          unit_label?: OutputUnit
          benefit_mode?: BenefitMode | null
          benefit_value?: number | null
          current_sale_price?: number | null
          notes?: string | null
        }
        Update: {
          name?: string
          units_produced?: number
          unit_label?: OutputUnit
          benefit_mode?: BenefitMode | null
          benefit_value?: number | null
          current_sale_price?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      production_ingredients: {
        Row: {
          id: string
          production_id: string
          material_id: string
          quantity_used: number
          created_at: string
        }
        Insert: {
          id?: string
          production_id: string
          material_id: string
          quantity_used: number
        }
        Update: {
          material_id?: string
          quantity_used?: number
        }
        Relationships: []
      }
      production_charges: {
        Row: {
          id: string
          production_id: string
          name: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          production_id: string
          name: string
          amount: number
        }
        Update: {
          name?: string
          amount?: number
        }
        Relationships: []
      }
      resales: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: number
          unit_label: OutputUnit
          purchase_price: number
          benefit_mode: BenefitMode | null
          benefit_value: number | null
          current_sale_price: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          quantity: number
          unit_label?: OutputUnit
          purchase_price: number
          benefit_mode?: BenefitMode | null
          benefit_value?: number | null
          current_sale_price?: number | null
          notes?: string | null
        }
        Update: {
          name?: string
          quantity?: number
          unit_label?: OutputUnit
          purchase_price?: number
          benefit_mode?: BenefitMode | null
          benefit_value?: number | null
          current_sale_price?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      resale_charges: {
        Row: {
          id: string
          resale_id: string
          name: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          resale_id: string
          name: string
          amount: number
        }
        Update: {
          name?: string
          amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      materials_with_costs: {
        Row: {
          id: string
          user_id: string
          name: string
          unit: MeasureUnit
          quantity_purchased: number
          quantity_remaining: number
          purchase_price: number
          created_at: string
          updated_at: string
          charges_total: number
          real_lot_cost: number
          unit_cost: number | null
        }
      }
    }
    Functions: Record<string, never>
    Enums: {
      measure_unit: MeasureUnit
      output_unit: OutputUnit
      benefit_mode: BenefitMode
    }
    CompositeTypes: Record<string, never>
  }
}

export type Material = Database['public']['Tables']['materials']['Row']
export type MaterialCharge = Database['public']['Tables']['material_charges']['Row']
export type Production = Database['public']['Tables']['productions']['Row']
export type ProductionIngredient =
  Database['public']['Tables']['production_ingredients']['Row']
export type ProductionCharge =
  Database['public']['Tables']['production_charges']['Row']
export type Resale = Database['public']['Tables']['resales']['Row']
export type ResaleCharge = Database['public']['Tables']['resale_charges']['Row']
export type MaterialWithCosts =
  Database['public']['Views']['materials_with_costs']['Row']
