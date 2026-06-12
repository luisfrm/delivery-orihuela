"use server"

import { createClient } from "@supabase/supabase-js"
import type { AuthResult } from "@/lib/actions/auth"

function getServiceRoleClient() {
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

/**
 * Verifica si ya existe al menos un usuario con role = 'admin' en app_metadata.
 * Usa el service role para bypasear RLS.
 */
export async function checkAdminExists(): Promise<{ exists: boolean; error?: string }> {
  try {
    const supabase = getServiceRoleClient()

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("[checkAdminExists]", error.message)
      return { exists: false, error: error.message }
    }

    const adminExists = data.users.some((u) => u.app_metadata?.role === "admin")
    return { exists: adminExists }
  } catch (err) {
    console.error("[checkAdminExists] unexpected error:", err)
    return { exists: false, error: "Error inesperado al verificar el administrador." }
  }
}

/**
 * Crea el primer usuario administrador.
 * Guarda role='admin' en app_metadata (no editable por el usuario).
 * El proxy lee el rol directamente del JWT sin queries a la DB.
 */
export async function createFirstAdmin(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthResult> {
  try {
    const { exists } = await checkAdminExists()
    if (exists) {
      return { error: "Ya existe un administrador. Inicia sesión en el panel.", code: "permission_denied" }
    }

    const supabase = getServiceRoleClient()

    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
      app_metadata: {
        role: "admin",
      },
    })

    if (createError || !data.user) {
      return {
        error: createError?.message ?? "No se pudo crear el administrador.",
        code: "auth_failed",
      }
    }

    return { success: true }
  } catch (err) {
    console.error("[createFirstAdmin] unexpected error:", err)
    return { error: "Error inesperado. Intenta de nuevo.", code: "auth_failed" }
  }
}
