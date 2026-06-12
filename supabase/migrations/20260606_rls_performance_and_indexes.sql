-- ============================================
-- Migration: rls_performance_and_indexes
-- Description:
--   1. Fix auth.uid() → (select auth.uid()) in all RLS policies (5-10x perf gain)
--   2. Add missing indexes on FK columns
--   3. Fix search_path on update_updated_at() trigger function
-- ============================================

-- ============================================
-- SECTION 1: Fix update_updated_at search_path
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ============================================
-- SECTION 2: FK Indexes
-- (Postgres does NOT auto-index FK columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id   ON user_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id         ON orders (client_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id         ON orders (driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id          ON orders (store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id     ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id   ON order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id        ON products (store_id);
CREATE INDEX IF NOT EXISTS idx_custom_stores_suggested_by ON custom_stores (suggested_by);


-- ============================================
-- SECTION 3: Fix RLS policies — auth.uid() → (select auth.uid())
-- Wrapping in (select ...) causes the function to be evaluated once
-- per query instead of once per row. 5-10x faster on large tables.
-- ============================================

-- ---- user_profiles ----

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- user_addresses ----

DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  USING ((select auth.uid()) = user_id);


-- ---- stores ----

DROP POLICY IF EXISTS "Admins can insert stores" ON stores;
CREATE POLICY "Admins can insert stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update stores" ON stores;
CREATE POLICY "Admins can update stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete stores" ON stores;
CREATE POLICY "Admins can delete stores"
  ON stores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- categories ----

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- products ----

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- product_categories ----

DROP POLICY IF EXISTS "Admins can manage product categories" ON product_categories;
CREATE POLICY "Admins can manage product categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- orders ----

DROP POLICY IF EXISTS "Clients can view own orders" ON orders;
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  USING ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
CREATE POLICY "Riders can view assigned orders"
  ON orders FOR SELECT
  USING ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;
CREATE POLICY "Riders can update assigned orders"
  ON orders FOR UPDATE
  USING ((select auth.uid()) = driver_id);

DROP POLICY IF EXISTS "Admins can update any order" ON orders;
CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- order_items ----

DROP POLICY IF EXISTS "Users can view order items for own orders" ON order_items;
CREATE POLICY "Users can view order items for own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.client_id = (select auth.uid()) OR orders.driver_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- custom_stores ----

DROP POLICY IF EXISTS "Users can insert custom stores" ON custom_stores;
CREATE POLICY "Users can insert custom stores"
  ON custom_stores FOR INSERT
  WITH CHECK ((select auth.uid()) = suggested_by);

DROP POLICY IF EXISTS "Admins can view all custom stores" ON custom_stores;
CREATE POLICY "Admins can view all custom stores"
  ON custom_stores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );


-- ---- settings ----

DROP POLICY IF EXISTS "Admins can manage settings" ON settings;
CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );
