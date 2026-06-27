-- ============================================
-- Migration: add_payment_fields_to_orders
-- Description:
--   Add columns to orders to store the selected payment method
--   and the values filled in by the client at checkout.
--
--   payment_method_id is nullable so existing orders (without a
--   payment method) keep working and admins can introduce the
--   payment step gradually. The frontend requires the user to
--   select a method before submitting.
--
--   payment_method_name and payment_values are SNAPSHOTS of the
--   method at order-creation time. If the admin edits or deletes
--   the payment method later, the order still has the data it
--   needs to display correctly. The values include a snapshot
--   of each field's label, so we don't need to JOIN
--   payment_methods to render the order.
--
--   RLS is unchanged: the existing policies
--   ("Clients can view own orders" + "Authenticated users can
--   create orders" + "Admins can view/update all orders") cover
--   the new columns automatically.
-- ============================================

alter table orders
  add column payment_method_id uuid references payment_methods(id) on delete set null,
  add column payment_method_name text,
  add column payment_values jsonb not null default '[]'::jsonb;

comment on column orders.payment_method_id is 'FK al método de pago seleccionado al crear el pedido (opcional)';
comment on column orders.payment_method_name is 'Snapshot del nombre del método de pago al momento de crear el pedido';
comment on column orders.payment_values is 'Valores llenados por el cliente: [{fieldId, type, label, value}]. value es texto o URL pública de la imagen.';
