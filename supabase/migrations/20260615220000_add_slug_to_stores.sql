-- Migration: Add slug to stores
-- Description: Stores gain a URL-friendly slug generated from the name.
--              The slug is used in routes (e.g. /panel/restaurants/la-cantina/menu)
--              instead of the internal UUID. A short random suffix is appended on
--              creation to avoid collisions.

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS slug text;

-- Backfill any existing stores (table is empty in practice, but be safe)
UPDATE stores
  SET slug = LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) || '-' || SUBSTRING(id::text, 1, 8)
  WHERE slug IS NULL;

-- Unique index: enforces uniqueness and speeds up lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_slug_unique ON stores (slug);

COMMENT ON COLUMN stores.slug IS
  'URL-friendly identifier generated from the name. Used in admin routes instead of the UUID.';
