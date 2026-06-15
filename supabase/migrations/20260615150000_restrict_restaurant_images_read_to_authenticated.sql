-- Migration: Restrict restaurant-images read policy to authenticated users
-- Description: The previous "Public can read restaurant images" SELECT policy
--              on storage.objects was flagged by Supabase as overly broad:
--              it allowed unauthenticated clients to list every file in the
--              bucket, exposing the file structure (which embeds the
--              restaurant UUIDs) and future uploads.
--
--              The bucket itself stays public so direct HTTP GET requests
--              on file URLs continue to work for everyone (e.g. <img>
--              tags, next/image). Only the Storage API SELECT path is
--              tightened to authenticated users, which is sufficient
--              for the current flows:
--                - Card rendering uses URLs from the DB (HTTP GET, no API)
--                - Admin/server actions use the service role key (bypasses RLS)
--                - No client flow currently lists the bucket

DROP POLICY IF EXISTS "Public can read restaurant images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read restaurant images" ON storage.objects;

CREATE POLICY "Authenticated can read restaurant images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'Delivery Orihuela Bucket');
