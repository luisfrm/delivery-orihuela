-- Description: Add address_id FK and snapshot fields for delivery address on orders
ALTER TABLE orders
  ADD COLUMN delivery_address_name text,
  ADD COLUMN delivery_address_line text,
  ADD COLUMN address_id uuid references user_addresses(id) on delete set null;

CREATE INDEX IF NOT EXISTS idx_orders_address_id ON orders (address_id);

COMMENT ON COLUMN orders.delivery_address_name IS 'Snapshot del nombre de la dirección al momento de crear la orden';
COMMENT ON COLUMN orders.delivery_address_line IS 'Snapshot de la dirección completa al momento de crear la orden';
COMMENT ON COLUMN orders.address_id IS 'FK opcional a user_addresses (puede ser null si la dirección fue eliminada)';
