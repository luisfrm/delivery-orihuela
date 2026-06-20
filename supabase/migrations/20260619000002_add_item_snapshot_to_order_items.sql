-- Description: Add product snapshot fields and make product_id nullable on order_items
ALTER TABLE order_items
  ADD COLUMN product_name text,
  ADD COLUMN product_picture_url text;

ALTER TABLE order_items
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE order_items
  DROP CONSTRAINT order_items_product_id_fkey;

ALTER TABLE order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

COMMENT ON COLUMN order_items.product_name IS 'Snapshot del nombre del producto al momento de crear la orden';
COMMENT ON COLUMN order_items.product_picture_url IS 'Snapshot de la URL de imagen al momento de crear la orden';
