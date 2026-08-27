-- Pagination index for admin orders (status + created_at desc)
-- Supports getAdminOrdersPage: WHERE status IN (...) + ORDER BY created_at DESC + RANGE + dateFilter
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at_desc
  ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc
  ON orders (created_at DESC);
