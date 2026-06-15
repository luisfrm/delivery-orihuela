-- Migration: Replace store_categories join table with a text field on stores
-- Description: For the MVP, restaurant categories are a hardcoded constant in
--              `lib/restaurants/categories.ts`. Storing the selected category
--              ids as a single text column (semicolon-separated) avoids the
--              need for a full categories module while preserving queryability.

DROP TABLE IF EXISTS store_categories CASCADE;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS category_ids text;

COMMENT ON COLUMN stores.category_ids IS
  'Semicolon-separated category slugs from RESTAURANT_CATEGORIES (e.g. "mexican;italian").';
