-- ============================================
-- Migration: rename_at_store_to_at_customer
-- Description: Renombrar estado del enum at_store → at_customer
-- ============================================

-- Renombrar valor del enum
ALTER TYPE order_status RENAME VALUE 'at_store' TO 'at_customer';

-- Actualizar comentario de la columna
COMMENT ON COLUMN orders.status IS 
  'Estado del pedido: pending, assigned, at_customer (rider llegó al cliente), on_the_way, delivered, cancelled';
