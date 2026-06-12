-- ============================================
-- Migration: final_auth_architecture
-- Description: 
--   1. Drop old RLS policies that depend on user_profiles.role (must go first)
--   2. Drop role column from user_profiles (role lives in app_metadata/JWT)
--   3. Restore first_name, last_name, phone columns to user_profiles
--   4. Final secure trigger: copies profile data, sets role:'user' in app_metadata
--   5. Recreate ALL RLS policies using JWT app_metadata for role checks
-- ============================================


-- ============================================
-- SECTION 1: Drop ALL old policies that reference user_profiles.role
-- (Must happen BEFORE dropping the column)
-- ============================================

-- user_profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON user_profiles;

-- stores
DROP POLICY IF EXISTS "Admins can insert stores" ON stores;
DROP POLICY IF EXISTS "Admins can update stores" ON stores;
DROP POLICY IF EXISTS "Admins can delete stores" ON stores;

-- categories
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- products
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- product_categories
DROP POLICY IF EXISTS "Admins can manage product categories" ON product_categories;

-- orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update any order" ON orders;

-- order_items
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;

-- custom_stores
DROP POLICY IF EXISTS "Admins can view all custom stores" ON custom_stores;

-- settings
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;


-- ============================================
-- SECTION 2: Drop role column (now safe — no dependencies)
-- ============================================

-- role no longer belongs here — it lives in app_metadata / JWT
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;


-- ============================================
-- SECTION 3: Restore profile columns
-- ============================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone      text NOT NULL DEFAULT '';


-- ============================================
-- SECTION 4: Final secure trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Copy profile data from user_metadata to user_profiles
  INSERT INTO public.user_profiles (id, first_name, last_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );

  -- Set role:'user' in app_metadata ONLY if not already set
  -- (preserves 'admin' set by createFirstAdmin before the insert)
  IF (new.raw_app_meta_data->>'role') IS NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "user"}'::jsonb
    WHERE id = new.id;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================
-- SECTION 5: Recreate RLS policies using JWT app_metadata
-- (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
-- No JOIN to user_profiles needed — role travels in the JWT
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

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- stores ----

CREATE POLICY "Admins can insert stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update stores"
  ON stores FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete stores"
  ON stores FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- categories ----

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- products ----

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- product_categories ----

CREATE POLICY "Admins can manage product categories"
  ON product_categories FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- orders ----

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- order_items ----

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- custom_stores ----

CREATE POLICY "Admins can view all custom stores"
  ON custom_stores FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ---- settings ----

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
