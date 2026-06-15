-- Migration: Fix restaurant-images storage policies
-- Description: The previous admin-only policies used
--              (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', which
--              denies service_role uploads (the service role JWT has no
--              app_metadata.role claim). This migration:
--                1. Re-creates the admin policies (in case they were dropped
--                   manually from the Supabase dashboard)
--                2. Adds an explicit service_role policy so server actions
--                   can upload without going through the role check
--                3. Keeps the authenticated SELECT policy that was set up
--                   in the previous migration

-- Re-create admin policies for client-side admin operations
DROP POLICY IF EXISTS "Admins can upload restaurant images" ON storage.objects;
CREATE POLICY "Admins can upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'Delivery Orihuela Bucket'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update restaurant images" ON storage.objects;
CREATE POLICY "Admins can update restaurant images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'Delivery Orihuela Bucket'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Admins can delete restaurant images" ON storage.objects;
CREATE POLICY "Admins can delete restaurant images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'Delivery Orihuela Bucket'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Explicit service_role policy for server actions
-- The service role JWT has no app_metadata.role, so the admin policies
-- above would deny it. service_role is a trusted Postgres role used only
-- on the server, so we let it manage all objects in this bucket.
DROP POLICY IF EXISTS "Service role can manage restaurant images" ON storage.objects;
CREATE POLICY "Service role can manage restaurant images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'Delivery Orihuela Bucket')
  WITH CHECK (bucket_id = 'Delivery Orihuela Bucket');
