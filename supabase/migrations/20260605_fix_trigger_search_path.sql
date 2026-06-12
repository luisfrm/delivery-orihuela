-- ============================================
-- Migration: fix_trigger_search_path
-- Description: Fix trigger search_path and remove problematic RLS policy
-- ============================================

-- 1. Arreglar trigger con search_path correcto
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (
    new.id,
    COALESCE(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'user'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Eliminar política INSERT problemática
-- Esta política no aporta valor porque:
-- - El registro público lo maneja el trigger con SECURITY DEFINER
-- - El rol se asigna desde user_metadata
-- - No tenemos módulo de gestión de usuarios que requiera admin insert
DROP POLICY IF EXISTS "Admins can insert any profile" ON user_profiles;