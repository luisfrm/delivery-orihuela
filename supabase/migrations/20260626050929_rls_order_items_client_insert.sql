-- ============================================
-- Migration: rls_order_items_client_insert
-- Description:
--   Allow authenticated clients to insert order_items
--   for orders they own (client_id = auth.uid()).
--
--   This is required because:
--   - "Admins can manage order items" only covers admins (FOR ALL)
--   - "Users can view order items for own orders" is SELECT-only
--
--   Without this policy, client orders are created with the order row
--   succeeding, but the order_items insert fails silently (only
--   console.error in the service), resulting in orders with
--   items_estimated_cost set but 0 rows in order_items.
-- ============================================

CREATE POLICY "Clients can insert order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.client_id = (select auth.uid())
    )
  );
