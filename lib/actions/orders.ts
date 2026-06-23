"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { OrdersService } from "@/lib/services/orders.service"
import { Order, OrderStatus, OrderWithDetails } from "@/lib/types"

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

export async function getOrdersWithDetails(): Promise<OrderWithDetails[]> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  return service.getUserOrdersWithDetails(user.id)
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  return service.getOrderById(orderId)
}

export async function getAdminOrders(
  statuses?: OrderStatus[]
): Promise<Order[]> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  return service.getAdminOrders(statuses)
}

export async function getActiveAdminOrders(): Promise<Order[]> {
  return getAdminOrders([
    "pending",
    "assigned",
    "at_customer",
    "on_the_way",
  ])
}

export async function getCompletedAdminOrders(): Promise<Order[]> {
  return getAdminOrders(["delivered", "cancelled"])
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

  // Fetch all user profiles
  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id, first_name, last_name, phone")
    .limit(100)

  if (error) {
    console.error("Error fetching riders:", error)
    return []
  }

  if (!profiles || profiles.length === 0) {
    return []
  }

  // Use the Admin API to get auth user data (roles live in app_metadata)
  // .from("auth.users") does NOT work via PostgREST — auth schema is not exposed
  const { data: authList } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })

  const authUsers = authList?.users ?? []

  const riders = profiles.map((profile) => {
    const authUser = authUsers.find((u) => u.id === profile.id)
    const role = authUser?.app_metadata?.role as string | undefined
    // Include both riders and admins (admins can accept and deliver orders)
    if (role !== "rider" && role !== "admin") return null
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

// ============================================
// Order State Transitions (Admin Panel)
// ============================================

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, error: "Usuario no autenticado" }
  }

  if (user.app_metadata?.role !== "admin") {
    return { ok: false as const, error: "No tienes permisos de administrador" }
  }

  return { ok: true as const, userId: user.id }
}

/**
 * Aceptar pedido: el admin acepta el pedido y lo asigna al rider autenticado
 */
export async function acceptOrder(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin.ok) return { error: admin.error }

  const supabase = await createClient()
  const service = new OrdersService(supabase)

  // Asignar al rider que está aceptando (el admin logueado)
  return service.assignRider(orderId, admin.userId)
}

/**
 * Iniciar entrega: cambia estado de assigned a on_the_way
 */
export async function startDelivery(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin.ok) return { error: admin.error }

  const supabase = await createClient()
  const service = new OrdersService(supabase)

  // Verificar que el pedido esté asignado
  const order = await service.getOrderById(orderId)
  if (!order) return { error: "Pedido no encontrado" }
  if (order.status !== "assigned") {
    return { error: "El pedido debe estar asignado para iniciar entrega" }
  }

  return service.updateOrderStatus(orderId, "on_the_way")
}

/**
 * Llegar al cliente: cambia estado de on_the_way a at_customer
 */
export async function arriveAtCustomer(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin.ok) return { error: admin.error }

  const supabase = await createClient()
  const service = new OrdersService(supabase)

  const order = await service.getOrderById(orderId)
  if (!order) return { error: "Pedido no encontrado" }
  if (order.status !== "on_the_way") {
    return { error: "El pedido debe estar en camino para marcar llegada" }
  }

  return service.updateOrderStatus(orderId, "at_customer")
}

/**
 * Completar pedido: cambia estado de at_customer a delivered
 */
export async function completeOrder(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin.ok) return { error: admin.error }

  const supabase = await createClient()
  const service = new OrdersService(supabase)

  const order = await service.getOrderById(orderId)
  if (!order) return { error: "Pedido no encontrado" }
  if (order.status !== "at_customer") {
    return { error: "El rider debe estar en el cliente para completar" }
  }

  return service.updateOrderStatus(orderId, "delivered")
}

/**
 * Desasignar pedido: remueve el rider asignado y vuelve a pending
 */
export async function unassignOrder(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin.ok) return { error: admin.error }

  const supabase = await createServiceRoleClient()

  const { error } = await supabase
    .from("orders")
    .update({ rider_id: null, status: "pending" })
    .eq("id", orderId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}