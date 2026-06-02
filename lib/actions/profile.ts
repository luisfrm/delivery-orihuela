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
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: error?.message ?? "Usuario no encontrado" }
  }

  return {
    firstName: user.user_metadata?.first_name ?? "",
    lastName: user.user_metadata?.last_name ?? "",
    email: user.email ?? "",
  }
}

export async function updateProfile(
  firstName: string,
  lastName: string
): Promise<ProfileResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    data: { first_name: firstName, last_name: lastName },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
