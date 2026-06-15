-- Migration: Add description to products
-- Description: Add an optional product description for the menu editor.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS description text;
