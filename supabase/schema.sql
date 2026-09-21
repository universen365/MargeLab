-- =============================================================================
-- MargeLab — schéma Supabase (MVP)
-- Aligné sur Cahier des charges.md v2
--
-- Comment l’utiliser :
-- 1. Crée le projet sur https://supabase.com
-- 2. SQL Editor → New query → colle ce fichier → Run
-- 3. Authentication → active Email (un compte pour l’utilisatrice suffit)
-- 4. Settings → API → note Project URL + anon key (pour l’app plus tard)
--
-- Les coûts totaux / unitaires / prix suggérés se CALCULENT dans l’app.
-- On stocke les entrées + l’objectif de bénéfice choisi.
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.measure_unit as enum (
  'g',
  'kg',
  'ml',
  'L',
  'piece'
);

create type public.output_unit as enum (
  'pot',
  'bottle',
  'piece',
  'box',
  'other'
);

-- Comment elle veut gagner : % sur le coût, ou francs par unité
create type public.benefit_mode as enum (
  'percent',
  'fixed_per_unit'
);

-- ---------------------------------------------------------------------------
-- Matières
-- ---------------------------------------------------------------------------

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  unit public.measure_unit not null,
  quantity_purchased numeric(14, 4) not null check (quantity_purchased > 0),
  quantity_remaining numeric(14, 4) not null check (quantity_remaining >= 0),
  purchase_price numeric(14, 2) not null check (purchase_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint materials_remaining_lte_purchased
    check (quantity_remaining <= quantity_purchased)
);

create index materials_user_id_idx on public.materials (user_id);
create index materials_user_name_idx on public.materials (user_id, name);

comment on table public.materials is
  'Matières achetées (ingrédients, flacons, étiquettes…).';
comment on column public.materials.purchase_price is
  'Prix d’achat du lot (sans les charges).';
comment on column public.materials.quantity_remaining is
  'Mis à jour par l’app quand une production consomme la matière.';

-- Charges liées à une matière (transport, douane, etc.)
create table public.material_charges (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials (id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index material_charges_material_id_idx
  on public.material_charges (material_id);

-- ---------------------------------------------------------------------------
-- Productions (lots fabriqués)
-- ---------------------------------------------------------------------------

create table public.productions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  units_produced numeric(14, 4) not null check (units_produced > 0),
  unit_label public.output_unit not null default 'pot',
  -- Objectif de bénéfice (optionnel tant qu’elle n’a pas choisi)
  benefit_mode public.benefit_mode,
  benefit_value numeric(14, 4) check (benefit_value is null or benefit_value >= 0),
  -- Prix qu’elle pratique déjà (optionnel) pour comparer
  current_sale_price numeric(14, 2) check (current_sale_price is null or current_sale_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index productions_user_id_idx on public.productions (user_id);

comment on table public.productions is
  'Un lot réel fabriqué (ex. Crème — 20 pots).';

-- Ingrédients d’une production
create table public.production_ingredients (
  id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete restrict,
  quantity_used numeric(14, 4) not null check (quantity_used > 0),
  created_at timestamptz not null default now(),
  unique (production_id, material_id)
);

create index production_ingredients_production_id_idx
  on public.production_ingredients (production_id);
create index production_ingredients_material_id_idx
  on public.production_ingredients (material_id);

-- Charges de fabrication (main-d’œuvre, gaz, etc.) — pas des matières
create table public.production_charges (
  id uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions (id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index production_charges_production_id_idx
  on public.production_charges (production_id);

-- ---------------------------------------------------------------------------
-- Reventes (achetés pour revendre)
-- ---------------------------------------------------------------------------

create table public.resales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  quantity numeric(14, 4) not null check (quantity > 0),
  unit_label public.output_unit not null default 'piece',
  purchase_price numeric(14, 2) not null check (purchase_price >= 0),
  benefit_mode public.benefit_mode,
  benefit_value numeric(14, 4) check (benefit_value is null or benefit_value >= 0),
  current_sale_price numeric(14, 2) check (current_sale_price is null or current_sale_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resales_user_id_idx on public.resales (user_id);

create table public.resale_charges (
  id uuid primary key default gen_random_uuid(),
  resale_id uuid not null references public.resales (id) on delete cascade,
  name text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index resale_charges_resale_id_idx on public.resale_charges (resale_id);

-- ---------------------------------------------------------------------------
-- updated_at automatique
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger materials_set_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();

create trigger productions_set_updated_at
  before update on public.productions
  for each row execute function public.set_updated_at();

create trigger resales_set_updated_at
  before update on public.resales
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — chaque utilisatrice ne voit que ses données
-- ---------------------------------------------------------------------------

alter table public.materials enable row level security;
alter table public.material_charges enable row level security;
alter table public.productions enable row level security;
alter table public.production_ingredients enable row level security;
alter table public.production_charges enable row level security;
alter table public.resales enable row level security;
alter table public.resale_charges enable row level security;

-- Matières
create policy "materials_select_own"
  on public.materials for select
  using (auth.uid() = user_id);

create policy "materials_insert_own"
  on public.materials for insert
  with check (auth.uid() = user_id);

create policy "materials_update_own"
  on public.materials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "materials_delete_own"
  on public.materials for delete
  using (auth.uid() = user_id);

-- Charges matière (via propriété de la matière)
create policy "material_charges_select_own"
  on public.material_charges for select
  using (
    exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

create policy "material_charges_insert_own"
  on public.material_charges for insert
  with check (
    exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

create policy "material_charges_update_own"
  on public.material_charges for update
  using (
    exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

create policy "material_charges_delete_own"
  on public.material_charges for delete
  using (
    exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

-- Productions
create policy "productions_select_own"
  on public.productions for select
  using (auth.uid() = user_id);

create policy "productions_insert_own"
  on public.productions for insert
  with check (auth.uid() = user_id);

create policy "productions_update_own"
  on public.productions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "productions_delete_own"
  on public.productions for delete
  using (auth.uid() = user_id);

create policy "production_ingredients_select_own"
  on public.production_ingredients for select
  using (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  );

create policy "production_ingredients_insert_own"
  on public.production_ingredients for insert
  with check (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

create policy "production_ingredients_update_own"
  on public.production_ingredients for update
  using (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
    and exists (
      select 1 from public.materials m
      where m.id = material_id and m.user_id = auth.uid()
    )
  );

create policy "production_ingredients_delete_own"
  on public.production_ingredients for delete
  using (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  );

create policy "production_charges_select_own"
  on public.production_charges for select
  using (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  );

create policy "production_charges_insert_own"
  on public.production_charges for insert
  with check (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  );

create policy "production_charges_update_own"
  on public.production_charges for update
  using (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  );

create policy "production_charges_delete_own"
  on public.production_charges for delete
  using (
    exists (
      select 1 from public.productions p
      where p.id = production_id and p.user_id = auth.uid()
    )
  );

-- Reventes
create policy "resales_select_own"
  on public.resales for select
  using (auth.uid() = user_id);

create policy "resales_insert_own"
  on public.resales for insert
  with check (auth.uid() = user_id);

create policy "resales_update_own"
  on public.resales for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "resales_delete_own"
  on public.resales for delete
  using (auth.uid() = user_id);

create policy "resale_charges_select_own"
  on public.resale_charges for select
  using (
    exists (
      select 1 from public.resales r
      where r.id = resale_id and r.user_id = auth.uid()
    )
  );

create policy "resale_charges_insert_own"
  on public.resale_charges for insert
  with check (
    exists (
      select 1 from public.resales r
      where r.id = resale_id and r.user_id = auth.uid()
    )
  );

create policy "resale_charges_update_own"
  on public.resale_charges for update
  using (
    exists (
      select 1 from public.resales r
      where r.id = resale_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.resales r
      where r.id = resale_id and r.user_id = auth.uid()
    )
  );

create policy "resale_charges_delete_own"
  on public.resale_charges for delete
  using (
    exists (
      select 1 from public.resales r
      where r.id = resale_id and r.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Vues utiles (lecture seule) — coûts calculés côté SQL pour contrôle
-- L’UI peut aussi recalculer ; ces vues aident au debug / Table Editor
-- ---------------------------------------------------------------------------

create or replace view public.materials_with_costs
with (security_invoker = true)
as
select
  m.*,
  coalesce(sum(c.amount), 0)::numeric(14, 2) as charges_total,
  (m.purchase_price + coalesce(sum(c.amount), 0))::numeric(14, 2) as real_lot_cost,
  case
    when m.quantity_purchased > 0 then
      round(
        (m.purchase_price + coalesce(sum(c.amount), 0)) / m.quantity_purchased,
        6
      )
    else null
  end as unit_cost
from public.materials m
left join public.material_charges c on c.material_id = m.id
group by m.id;

comment on view public.materials_with_costs is
  'Matière + charges + coût réel du lot + coût d’une unité.';
