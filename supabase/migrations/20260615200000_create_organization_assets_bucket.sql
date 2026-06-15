-- Migration: Create public organization-assets storage bucket
-- Description: Public bucket for organization-level assets (logo, etc.).
--              - Max file size: 512 KB
--              - Accepted MIME types: image/jpeg, image/png, image/webp
--              - RLS: public read, admin-only write (admin via JWT, service_role bypass)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-assets',
  'organization-assets',
  true,
  524288,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---- RLS ----
-- Unified manage policy (admin OR service_role) so service role can upload
-- on behalf of admins, mirroring the restaurant-images bucket pattern.

DROP POLICY IF EXISTS "Public can read organization assets"           ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload organization assets"         ON storage.objects;
DROP POLICY IF EXISTS "Admins can update organization assets"         ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete organization assets"         ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage organization assets"   ON storage.objects;
DROP POLICY IF EXISTS "Organization assets: admin and service role can manage" ON storage.objects;
DROP POLICY IF EXISTS "Organization assets: authenticated can read"   ON storage.objects;

CREATE POLICY "Organization assets: admin and service role can manage"
  ON storage.objects FOR ALL
  TO authenticated, service_role
  USING (
    bucket_id = 'organization-assets'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.role() = 'service_role'
    )
  )
  WITH CHECK (
    bucket_id = 'organization-assets'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
      OR auth.role() = 'service_role'
    )
  );

CREATE POLICY "Organization assets: authenticated can read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'organization-assets');
