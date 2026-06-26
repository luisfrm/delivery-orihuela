-- ============================================
-- Migration: create_payment_methods_table
-- Description:
--   Create the payment_methods table that stores admin-defined
--   payment options available to clients during checkout.
--
--   Each method has:
--     - A fixed `name` (e.g. "Pago Móvil", "Transferencia").
--     - Up to 3 dynamic fields defined by the admin. Each field
--       has a `label` and a `type` ("text" or "image"). The
--       actual VALUE of each field is filled in by the client at
--       checkout time and persisted in the order (not here).
--
--   RLS matches the pattern of the `settings` table:
--     - SELECT: anyone (clients need to see methods at checkout)
--     - INSERT/UPDATE/DELETE: admins only
-- ============================================

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  fields jsonb not null default '[]'::jsonb,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payment_methods_position on payment_methods (position);

alter table payment_methods enable row level security;

create policy "Anyone can view payment methods"
  on payment_methods for select
  using (true);

create policy "Admins can manage payment methods"
  on payment_methods for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
