-- ============================================
-- Migration: role_and_profile_cleanup
-- Description: Rename driver→rider, cleanup user_profiles
-- ============================================

-- 1. Renombrar valor del enum driver → rider
ALTER TYPE user_role RENAME VALUE 'driver' TO 'rider';

-- 2. Eliminar columnas redundantes de user_profiles
-- (first_name, last_name, phone ya están en auth.users.user_metadata)
ALTER TABLE user_profiles 
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS phone;

-- 3. Actualizar trigger para leer role de user_metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (
    new.id,
    COALESCE(
      (new.raw_user_meta_data->>'role')::user_role,
      'user'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Actualizar políticas RLS que referencian 'driver' → 'rider'

-- orders: Drivers can view assigned orders
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON orders;
CREATE POLICY "Riders can view assigned orders"
  ON orders FOR SELECT
  USING (auth.uid() = driver_id);

-- orders: Drivers can update assigned orders  
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON orders;
CREATE POLICY "Riders can update assigned orders"
  ON orders FOR UPDATE
  USING (auth.uid() = driver_id);