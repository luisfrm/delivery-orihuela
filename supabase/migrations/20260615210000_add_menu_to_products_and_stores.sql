-- Migration: Add menu fields to products and stores
-- Description: Add the schema needed for the menu editor at
--              /panel/restaurants/[id]/menu.
--                - products.menu_category: slug of the section the
--                  product belongs to (entradas, platos-fuertes, ...)
--                - products.position: integer for ordering within the
--                  category (lower = earlier)
--                - products.estimated_price: switched from numeric(10,2)
--                  to bigint (cents). 100 = 1€. The products table is
--                  empty so no data conversion is needed.
--                - stores.menu_category_order: semicolon-separated slugs
--                  giving the display order of categories for this store
--                  (falls back to the MENU_CATEGORIES constant order).

-- ---- products ----

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS menu_category text,
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

ALTER TABLE products
  ALTER COLUMN estimated_price TYPE bigint USING estimated_price::bigint;

COMMENT ON COLUMN products.estimated_price IS
  'Price in cents. 100 = 1€. Display with Intl.NumberFormat.';

COMMENT ON COLUMN products.menu_category IS
  'Slug of the menu section the product belongs to. See MENU_CATEGORIES in lib/restaurants/menu-categories.ts.';

-- ---- stores ----

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS menu_category_order text;

COMMENT ON COLUMN stores.menu_category_order IS
  'Semicolon-separated category slugs giving the display order for this store. Falls back to the MENU_CATEGORIES constant when null.';

-- ---- indexes ----

CREATE INDEX IF NOT EXISTS idx_products_menu_order
  ON products (store_id, menu_category, position)
  WHERE menu_category IS NOT NULL;
