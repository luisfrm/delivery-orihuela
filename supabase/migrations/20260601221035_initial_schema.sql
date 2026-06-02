-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Use gen_random_uuid() for UUID generation (Postgres 13+ built-in)
-- gen_random_uuid() from uuid-ossp is also available

-- Enums
create type user_role as enum ('admin', 'driver', 'user');
create type service_type as enum ('buy_and_deliver', 'pickup_only');
create type order_status as enum ('pending', 'assigned', 'at_store', 'on_the_way', 'delivered', 'cancelled');

-- Tables
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  address_line text not null,
  city text not null default '',
  pickup_reference_notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  picture_url text,
  estimated_price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_categories (
  category_id uuid not null references categories(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (category_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references user_profiles(id) on delete restrict,
  driver_id uuid references user_profiles(id) on delete set null,
  store_id uuid not null references stores(id) on delete restrict,
  service_type service_type not null,
  status order_status not null default 'pending',
  pickup_reference text,
  items_estimated_cost numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null default 1,
  estimated_unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: auto-create user_profile on auth.users insert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, first_name, last_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_profiles_updated_at before update on user_profiles
  for each row execute procedure update_updated_at();
create trigger user_addresses_updated_at before update on user_addresses
  for each row execute procedure update_updated_at();
create trigger stores_updated_at before update on stores
  for each row execute procedure update_updated_at();
create trigger categories_updated_at before update on categories
  for each row execute procedure update_updated_at();
create trigger products_updated_at before update on products
  for each row execute procedure update_updated_at();
create trigger orders_updated_at before update on orders
  for each row execute procedure update_updated_at();
create trigger order_items_updated_at before update on order_items
  for each row execute procedure update_updated_at();

-- RLS Policies
alter table user_profiles enable row level security;
alter table user_addresses enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- user_profiles policies
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on user_profiles for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update any profile"
  on user_profiles for update
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert any profile"
  on user_profiles for insert
  with check (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- user_addresses policies
create policy "Users can view own addresses"
  on user_addresses for select
  using (auth.uid() = user_id);

create policy "Users can insert own addresses"
  on user_addresses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own addresses"
  on user_addresses for update
  using (auth.uid() = user_id);

create policy "Users can delete own addresses"
  on user_addresses for delete
  using (auth.uid() = user_id);

-- stores policies (public read for all authenticated)
create policy "Authenticated users can view stores"
  on stores for select
  to authenticated
  using (true);

create policy "Admins can insert stores"
  on stores for insert
  to authenticated
  with check (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update stores"
  on stores for update
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete stores"
  on stores for delete
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- categories policies (public read)
create policy "Authenticated users can view categories"
  on categories for select
  to authenticated
  using (true);

create policy "Admins can manage categories"
  on categories for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- products policies
create policy "Anyone can view active products"
  on products for select
  using (is_active = true);

create policy "Admins can manage products"
  on products for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- product_categories policies
create policy "Anyone can view product categories"
  on product_categories for select
  using (true);

create policy "Admins can manage product categories"
  on product_categories for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- orders policies
create policy "Clients can view own orders"
  on orders for select
  using (auth.uid() = client_id);

create policy "Drivers can view assigned orders"
  on orders for select
  using (auth.uid() = driver_id);

create policy "Admins can view all orders"
  on orders for select
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Authenticated users can create orders"
  on orders for insert
  with check (auth.uid() = client_id);

create policy "Drivers can update assigned orders"
  on orders for update
  using (auth.uid() = driver_id);

create policy "Admins can update any order"
  on orders for update
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- order_items policies
create policy "Users can view order items for own orders"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (orders.client_id = auth.uid() or orders.driver_id = auth.uid())
    )
  );

create policy "Admins can manage order items"
  on order_items for all
  to authenticated
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Grants
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;