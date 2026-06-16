-- ============================================
-- Migration: rename_driver_to_rider
-- Description: Renombrar columna driver_id → rider_id en tabla orders
-- ============================================

-- 1. Renombrar columna
ALTER TABLE orders RENAME COLUMN driver_id TO rider_id;

-- 2. Renombrar índice
ALTER INDEX idx_orders_driver_id RENAME TO idx_orders_rider_id;

-- 3. Actualizar políticas RLS en tabla orders
DROP POLICY IF EXISTS "Riders can view assigned orders" ON orders;
CREATE POLICY "Riders can view assigned orders"
  ON orders FOR SELECT
  USING ((select auth.uid()) = rider_id);

DROP POLICY IF EXISTS "Riders can update assigned orders" ON orders;
CREATE POLICY "Riders can update assigned orders"
  ON orders FOR UPDATE
  USING ((select auth.uid()) = rider_id);

-- 4. Actualizar política RLS en tabla order_items
DROP POLICY IF EXISTS "Users can view order items for own orders" ON order_items;
CREATE POLICY "Users can view order items for own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.client_id = (select auth.uid()) OR orders.rider_id = (select auth.uid()))
    )
  );
