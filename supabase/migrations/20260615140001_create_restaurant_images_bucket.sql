-- Migration: Create public restaurant-images storage bucket
-- Description: Public bucket for restaurant cover and logo images.
--              - Max file size: 512 KB
--              - Accepted MIME types: image/jpeg, image/png, image/webp
--              - RLS: public read, admin-only write

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Delivery Orihuela Bucket',
  'Delivery Orihuela Bucket',
  true,
  524288,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---- RLS ----

DROP POLICY IF EXISTS "Public can read restaurant images" ON storage.objects;
CREATE POLICY "Public can read restaurant images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'Delivery Orihuela Bucket');

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
