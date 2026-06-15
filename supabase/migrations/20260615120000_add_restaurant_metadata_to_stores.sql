-- Migration: Add restaurant metadata to stores + create store_categories join table
-- Description: Adds cover_image_url, logo_url, description columns to stores and a
--              many-to-many store_categories table so a store can belong to multiple
--              categories (mirroring the product_categories pattern).

-- ---- stores: add metadata columns ----

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS description text;

-- ---- store_categories: many-to-many join ----

CREATE TABLE IF NOT EXISTS store_categories (
  store_id uuid NOT NULL REFERENCES stores (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  PRIMARY KEY (store_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_store_categories_category_id
  ON store_categories (category_id);

ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

-- ---- RLS ----

DROP POLICY IF EXISTS "Authenticated users can view store_categories" ON store_categories;
CREATE POLICY "Authenticated users can view store_categories"
  ON store_categories FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage store_categories" ON store_categories;
CREATE POLICY "Admins can manage store_categories"
  ON store_categories FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
