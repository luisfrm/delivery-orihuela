import { createClient } from "@supabase/supabase-js"

/**
 * Cliente de Supabase con el service role key. Bypasea RLS
 * completamente porque el JWT tiene `role = 'service_role'`.
 *
 * Usar `createClient` de `@supabase/supabase-js` directamente
 * (en vez de `createServerClient` de `@supabase/ssr`) es
 * importante: `@supabase/ssr` está diseñado para sesiones de
 * usuario con cookies, y al pasarle el service role key el
 * JWT resultante puede no tener correctamente el claim
 * `role = 'service_role'`, lo que hace que las policies de
 * RLS que verifican `auth.role() = 'service_role'` rechacen
 * la operación (ej. uploads al bucket `organization-assets`).
 */
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
