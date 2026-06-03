"use server"

import { createClient } from "@/lib/supabase/server"
import { UserAddress } from "@/lib/types"

export interface AddressResult {
  success?: boolean
  error?: string
}

export async function getAddresses(): Promise<UserAddress[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching addresses:", error)
    return []
  }

  return data || []
}

export async function createAddress(
  name: string,
  addressLine: string,
  setAsDefault: boolean = false
): Promise<AddressResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  if (setAsDefault) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
  }

  const { error } = await supabase.from("user_addresses").insert({
    user_id: user.id,
    name,
    address_line: addressLine,
    city: "Orihuela",
    is_default: setAsDefault,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}