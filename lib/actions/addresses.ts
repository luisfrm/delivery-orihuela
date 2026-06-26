"use server"

import { createClient } from "@/lib/supabase/server"
import { AddressesService } from "@/lib/services/addresses.service"
import { UserAddress } from "@/lib/types"
import type { AddressResult } from "@/lib/services/addresses.service"

export async function getAddresses(): Promise<UserAddress[]> {
  const supabase = await createClient()
  const service = new AddressesService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  return service.getUserAddresses(user.id)
}

export async function createAddress(
  name: string,
  addressLine: string,
  setAsDefault: boolean = false
): Promise<AddressResult> {
  const supabase = await createClient()
  const service = new AddressesService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  return service.createAddress(user.id, { name, addressLine, setAsDefault })
}

export async function updateAddress(
  id: string,
  name: string,
  addressLine: string,
  setAsDefault: boolean = false
): Promise<AddressResult> {
  const supabase = await createClient()
  const service = new AddressesService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  return service.updateAddress(user.id, id, { name, addressLine, setAsDefault })
}

export async function deleteAddress(id: string): Promise<AddressResult> {
  const supabase = await createClient()
  const service = new AddressesService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  return service.deleteAddress(user.id, id)
}
