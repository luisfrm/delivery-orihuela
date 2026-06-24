-- Description: Expose the orders and order_items tables to Supabase Realtime
-- (Postgres Changes). The client /pedidos page already subscribes to changes
-- on `orders` filtered by client_id; the admin /panel/orders page will
-- subscribe to INSERT + UPDATE events on `orders`. Adding order_items as well
-- so a future order detail page can subscribe to item changes without a
-- second migration.
--
-- The supabase_realtime publication is the channel Supabase Realtime uses;
-- tables must be in it to emit events. RLS is still applied per-subscriber.

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
