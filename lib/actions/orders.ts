"use server"

import { createClient } from "@/lib/supabase/server"
import { Order } from "@/lib/types"

export interface CreateOrderParams {
  pickupReference: string
  storeId: string | null
  customStoreName: string | null
  customStoreAddress: string | null
  addressId: string
  additionalNotes: string | null
  deliveryFee: number
}

export interface OrderResult {
  success?: boolean
  error?: string
  orderId?: string
}

export async function createOrder(
  params: CreateOrderParams
): Promise<OrderResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Perfil de usuario no encontrado" }
  }

  const { data: address } = await supabase
    .from("user_addresses")
    .select("address_line")
    .eq("id", params.addressId)
    .single()

  if (!address) {
    return { error: "Dirección no encontrada" }
  }

  if (params.customStoreName && params.customStoreAddress) {
    await supabase.from("custom_stores").insert({
      name: params.customStoreName,
      address: params.customStoreAddress,
      suggested_by: profile.id,
    })
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: profile.id,
      store_id: params.storeId,
      custom_store_name: params.customStoreName,
      custom_store_address: params.customStoreAddress,
      service_type: "pickup_only",
      status: "pending",
      pickup_reference: params.pickupReference,
      items_estimated_cost: 0,
      delivery_fee: params.deliveryFee,
      total_amount: params.deliveryFee,
    })
    .select("id")
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, orderId: data.id }
}