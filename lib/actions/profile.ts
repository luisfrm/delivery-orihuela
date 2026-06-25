"use server"

import { createClient } from "@/lib/supabase/server"

export interface ProfileResult {
  success?: boolean
  error?: string
}

export async function getProfile() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: authError?.message ?? "Usuario no encontrado" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("first_name, last_name, phone")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { error: profileError?.message ?? "Perfil no encontrado" }
  }

  return {
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    phone: profile.phone ?? "",
    email: user.email ?? "",
  }
}

export async function updateProfile(
  firstName: string,
  lastName: string,
  phone?: string
): Promise<ProfileResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Usuario no autenticado" }
  }

  const updateData: Record<string, string> = {
    first_name: firstName,
    last_name: lastName,
  }
  if (phone !== undefined) {
    updateData.phone = phone
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
