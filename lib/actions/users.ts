"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { StaffRole, UserRole, UserWithProfile } from "@/lib/types"

export interface CreateStaffUserInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: StaffRole
}

export interface UpdateUserInput {
  firstName: string
  lastName: string
  phone: string
  role: UserRole
}

export interface CreateStaffUserResult {
  user?: UserWithProfile
  error?: string
}

export interface UpdateUserResult {
  user?: UserWithProfile
  error?: string
}

export interface DeleteUserResult {
  error?: string
}

export interface GetAllUsersResult {
  users: UserWithProfile[]
  error?: string
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, error: "No autenticado." }
  }
  if (user.app_metadata?.role !== "admin") {
    return { ok: false as const, error: "No tienes permisos." }
  }
  return { ok: true as const, userId: user.id }
}

const ROLE_ERROR_MAP: Record<string, string> = {
  "User already registered": "Este correo ya está registrado.",
  "A user with this email address has already been registered":
    "Este correo ya está registrado.",
  "Password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres.",
  "Signups not allowed for this instance":
    "El registro está deshabilitado temporalmente.",
  "Database error saving new user":
    "Error al guardar el usuario. Intenta de nuevo.",
}

function mapRoleError(message: string): string {
  if (ROLE_ERROR_MAP[message]) return ROLE_ERROR_MAP[message]
  for (const [key, val] of Object.entries(ROLE_ERROR_MAP)) {
    if (message.includes(key)) return val
  }
  return message || "Ocurrió un error inesperado."
}

function normalizeRole(value: unknown): UserRole {
  if (value === "admin" || value === "rider" || value === "user") {
    return value
  }
  return "user"
}

/**
 * Lista TODOS los usuarios del sistema (admins + riders + clientes).
 * Combina auth.users (roles en app_metadata) con user_profiles (datos de perfil)
 * haciendo JOIN en memoria — .from("auth.users") no funciona vía PostgREST.
 */
export async function getAllUsers(): Promise<GetAllUsersResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { users: [], error: auth.error }

  const supabase = await createServiceRoleClient()

  // 1) Listar todos los usuarios de auth (hasta 1000, suficiente para el panel)
  const { data: authList, error: authError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })

  if (authError) {
    console.error("[getAllUsers] auth error:", authError.message)
    return { users: [], error: "Error al listar usuarios." }
  }

  const authUsers = authList?.users ?? []

  // 2) Traer los perfiles (first_name, last_name, phone, created_at)
  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, first_name, last_name, phone, created_at")

  if (profileError) {
    console.error("[getAllUsers] profile error:", profileError.message)
    return { users: [], error: "Error al listar perfiles." }
  }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id as string, p])
  )

  // 3) Combinar
  const users: UserWithProfile[] = authUsers.map((u) => {
    const profile = profileMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? "",
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      phone: profile?.phone ?? "",
      role: normalizeRole(u.app_metadata?.role),
      created_at: profile?.created_at ?? u.created_at,
      auth_created_at: u.created_at,
    }
  })

  // Más recientes primero
  users.sort(
    (a, b) =>
      new Date(b.auth_created_at).getTime() -
      new Date(a.auth_created_at).getTime()
  )

  return { users }
}

/**
 * Crea un nuevo usuario staff (admin o rider) con email confirmado.
 * El trigger handle_new_user crea automáticamente la fila en user_profiles.
 */
export async function createStaffUser(
  input: CreateStaffUserInput
): Promise<CreateStaffUserResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createServiceRoleClient()

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
    },
    app_metadata: {
      role: input.role,
    },
  })

  if (createError || !data.user) {
    console.error("[createStaffUser]", createError?.message)
    return {
      error: mapRoleError(createError?.message ?? "No se pudo crear el usuario."),
    }
  }

  revalidatePath("/panel/users")

  const user: UserWithProfile = {
    id: data.user.id,
    email: data.user.email ?? input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    role: input.role,
    created_at: new Date().toISOString(),
    auth_created_at: data.user.created_at,
  }

  return { user }
}

/**
 * Edita los datos de un usuario existente.
 * El role se actualiza en auth.users.app_metadata (server-only).
 * Nombre/teléfono se actualizan en user_profiles.
 *
 * Acepta los tres roles (admin, rider, user) para permitir transiciones
 * como cliente → staff y staff → cliente. El alta de staff desde cero
 * sigue limitada a admin/rider vía `createStaffUser`.
 */
export async function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<UpdateUserResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  if (userId === auth.userId && input.role !== "admin") {
    return {
      error: "No puedes cambiar tu propio rol de administrador.",
    }
  }

  const supabase = await createServiceRoleClient()

  // 1) Verificar que el usuario existe y obtener su rol actual
  const { data: targetAuth, error: targetError } =
    await supabase.auth.admin.getUserById(userId)

  if (targetError || !targetAuth?.user) {
    return { error: "Usuario no encontrado." }
  }

  const currentRole = normalizeRole(targetAuth.user.app_metadata?.role)
  const isDemotingAdmin =
    currentRole === "admin" && input.role !== "admin"

  // 2) Si va a dejar de ser admin, asegurar que no sea el último
  if (isDemotingAdmin) {
    const { users } = await getAllUsers()
    const adminCount = users.filter((u) => u.role === "admin").length
    if (adminCount <= 1) {
      return {
        error:
          "No puedes degradar al último administrador. Asigna otro admin primero.",
      }
    }
  }

  // 3) Actualizar app_metadata.role si cambió
  if (currentRole !== input.role) {
    const { error: authUpdateError } =
      await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { role: input.role },
      })
    if (authUpdateError) {
      console.error("[updateUser] auth error:", authUpdateError.message)
      return { error: "Error al actualizar el rol del usuario." }
    }
  }

  // 4) Actualizar user_profiles (first_name, last_name, phone)
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
    })
    .eq("id", userId)
    .select("created_at")
    .single()

  if (profileError) {
    console.error("[updateUser] profile error:", profileError.message)
    return { error: "Error al actualizar el perfil del usuario." }
  }

  revalidatePath("/panel/users")

  const user: UserWithProfile = {
    id: userId,
    email: targetAuth.user.email ?? "",
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    role: input.role,
    created_at: profile?.created_at ?? targetAuth.user.created_at,
    auth_created_at: targetAuth.user.created_at,
  }

  return { user }
}

/**
 * Elimina un usuario del sistema.
 * auth.admin.deleteUser elimina de auth.users; CASCADE borra user_profiles.
 * Bloquea si se intenta eliminar al último admin.
 */
export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  if (userId === auth.userId) {
    return { error: "No puedes eliminarte a ti mismo." }
  }

  const supabase = await createServiceRoleClient()

  // 1) Verificar que existe y obtener rol
  const { data: targetAuth, error: targetError } =
    await supabase.auth.admin.getUserById(userId)

  if (targetError || !targetAuth?.user) {
    return { error: "Usuario no encontrado." }
  }

  const targetRole = normalizeRole(targetAuth.user.app_metadata?.role)

  // 2) Si es admin, asegurar que no sea el último
  if (targetRole === "admin") {
    const { users } = await getAllUsers()
    const adminCount = users.filter((u) => u.role === "admin").length
    if (adminCount <= 1) {
      return {
        error:
          "No puedes eliminar al último administrador. Asigna otro admin primero.",
      }
    }
  }

  // 3) Eliminar
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

  if (deleteError) {
    console.error("[deleteUser]", deleteError.message)
    return { error: "Error al eliminar el usuario." }
  }

  revalidatePath("/panel/users")
  return {}
}
