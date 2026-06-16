"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { OrdersService } from "@/lib/services/orders.service"
import { Order } from "@/lib/types"

export interface RiderProfile {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
}

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  return service.getUserOrders(user.id)
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  return service.getOrderById(orderId)
}

export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  return service.getAdminOrders()
}

export async function createOrder(
  params: Parameters<typeof import("@/lib/services/orders.service").OrdersService.prototype.createOrder>[0]
): Promise<import("@/lib/services/orders.service").OrderResult> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)

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

  return service.createOrder(params, profile.id)
}

export async function cancelOrder(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  return service.cancelOrder(orderId, user.id)
}

export async function updateOrderStatus(
  orderId: string,
  status: import("@/lib/types").OrderStatus
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  return service.updateOrderStatus(orderId, status)
}

export async function assignRider(
  orderId: string,
  riderId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  return service.assignRider(orderId, riderId)
}

export async function getRiders(): Promise<RiderProfile[]> {
  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, first_name, last_name, phone")
    .limit(100)

  if (error) {
    console.error("Error fetching riders:", error)
    return []
  }

  const profileIds = (data || []).map((p) => p.id)

  if (profileIds.length === 0) {
    return []
  }

  const { data: authData } = await supabase
    .from("auth.users")
    .select("id, email, raw_app_meta_data")
    .in("id", profileIds)

  const riders = (data || []).map((profile) => {
    const authUser = authData?.find((u) => u.id === profile.id)
    const role = authUser?.raw_app_meta_data?.role as string | undefined
    if (role !== "rider") return null
    return {
      id: profile.id,
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      email: authUser?.email ?? "",
    }
  }).filter(Boolean) as RiderProfile[]

  return riders
}