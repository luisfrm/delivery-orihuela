-- ============================================
-- Migration: rls_user_profiles_view_rider
-- Description:
--   Allow clients to view the user_profiles row of any rider
--   who is currently assigned to one of their orders.
--   Required so /pedidos can show the WhatsApp/Call buttons
--   to the rider (rider name + phone).
--
--   Previously this was fetched via the service role client
--   to bypass RLS. Moving the authorization to RLS removes
--   the need for the service role key on the client-facing
--   read path.
-- ============================================

CREATE POLICY "Clients can view rider profiles for their orders"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.rider_id = user_profiles.id
        AND orders.client_id = (select auth.uid())
    )
  );
