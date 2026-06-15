-- Migration: Unify restaurant-images storage policies
-- Description: The previous fix used a `TO service_role` policy, but
--              Supabase Storage RLS does not always honor that clause
--              in all versions — the service_role JWT is still evaluated
--              against the role check.
--
--              This migration takes a defensive approach:
--                1. Drops every existing policy on storage.objects that
--                   could match this bucket, so the database starts from
--                   a known state.
--                2. Creates a single unified policy for INSERT/UPDATE/
--                   DELETE that uses `auth.role() = 'service_role'` in
--                   addition to the admin JWT check. This works across
--                   Supabase versions because auth.role() reflects the
--                   actual Postgres role the request is running as.
--                3. Keeps the authenticated-only SELECT policy.

-- ---- Drop every possibly-existing policy on this bucket ----

DROP POLICY IF EXISTS "Admins can upload restaurant images"      ON storage.objects;
DROP POLICY IF EXISTS "Admins can update restaurant images"      ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete restaurant images"      ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage restaurant images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read restaurant images"         ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read restaurant images"  ON storage.objects;

-- ---- Unified manage policy (admin OR service_role) ----

CREATE POLICY "Restaurant images: admin and service role can manage"
  ON storage.objects FOR ALL
  TO authenticated, service_role
  USING (
    bucket_id = 'Delivery Orihuela Bucket'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.role() = 'service_role'
    )
  )
  WITH CHECK (
    bucket_id = 'Delivery Orihuela Bucket'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.role() = 'service_role'
    )
  );

-- ---- Authenticated-only read ----

CREATE POLICY "Restaurant images: authenticated can read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'Delivery Orihuela Bucket');
