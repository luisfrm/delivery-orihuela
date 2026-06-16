-- ============================================
-- Migration: add_order_number
-- Description: Agregar columna order_number (integer, auto-incremental desde 1)
-- ============================================

-- 1. Crear secuencia para order_number
CREATE SEQUENCE orders_order_number_seq START 1;

-- 2. Agregar columna order_number
ALTER TABLE orders 
  ADD COLUMN order_number integer;

-- 3. Poblar order_number para pedidos existentes (si hay)
UPDATE orders 
  SET order_number = nextval('orders_order_number_seq');

-- 4. Hacer columna NOT NULL después de poblar
ALTER TABLE orders 
  ALTER COLUMN order_number SET NOT NULL;

-- 5. Configurar valor por defecto desde la secuencia
ALTER TABLE orders 
  ALTER COLUMN order_number SET DEFAULT nextval('orders_order_number_seq');

-- 6. Hacer la secuencia propiedad de la columna (auto-drop si se elimina la columna)
ALTER SEQUENCE orders_order_number_seq OWNED BY orders.order_number;

-- 7. Agregar constraint UNIQUE
ALTER TABLE orders 
  ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

-- 8. Crear índice para búsquedas rápidas
CREATE INDEX idx_orders_order_number ON orders (order_number);
