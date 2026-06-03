-- Migration: pickup_form_schema
-- Description: Add name field to user_addresses, make store_id nullable, create custom_stores and settings tables

-- 1. Add name field to user_addresses
alter table user_addresses 
add column name text not null default '';

-- 2. Make store_id nullable in orders and add custom store fields
alter table orders 
alter column store_id drop not null,
add column custom_store_name text,
add column custom_store_address text;

-- Add constraint to ensure either store_id or custom_store fields exist
alter table orders add constraint store_check 
check (
  (store_id is not null) or 
  (custom_store_name is not null and custom_store_address is not null)
);

-- 3. Create custom_stores table for tracking user-suggested stores
create table custom_stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  suggested_by uuid not null references user_profiles(id),
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table custom_stores enable row level security;

create policy "Users can insert custom stores"
  on custom_stores for insert
  with check (auth.uid() = suggested_by);

create policy "Admins can view all custom stores"
  on custom_stores for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. Create settings table for global configuration
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Insert default values
insert into settings (key, value) values 
('delivery_fee', '4');

alter table settings enable row level security;

create policy "Anyone can view settings"
  on settings for select
  using (true);

create policy "Admins can manage settings"
  on settings for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );