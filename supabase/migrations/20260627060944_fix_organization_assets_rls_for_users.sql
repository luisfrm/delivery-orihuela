-- ============================================
-- Migration: fix_organization_assets_rls_for_users
-- Description:
--   Allow any authenticated user to INSERT and UPDATE files
--   in the organization-assets bucket. This is needed so that
--   regular users (not just admins) can upload payment method
--   images (comprobantes de pago) directly from the client.
--
--   DELETE remains restricted to service_role (which bypasses
--   RLS automatically by the role claim in the JWT). This
--   prevents regular users from deleting arbitrary files from
--   the bucket. Admin cleanup operations use the service
--   role client.
--
--   The path structure (payments/{methodId}/{uploadToken}-{fieldId}.{ext})
--   provides logical isolation per payment: each upload has a
--   unique UUID token, so collisions are impossible and orphan
--   files (if the order creation fails after upload) don't
--   interfere with anything.
-- ============================================

DROP POLICY IF EXISTS "Organization assets: admin and service role can manage"
  ON storage.objects;

CREATE POLICY "Organization assets: authenticated can insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'organization-assets');

CREATE POLICY "Organization assets: authenticated can update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'organization-assets')
  WITH CHECK (bucket_id = 'organization-assets');
