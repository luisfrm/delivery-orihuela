"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { Order, OrderStatus, OrderWithClient, OrderWithDetails } from "@/lib/types"
import { PushService } from "@/lib/services/push.service"

async function notifyOrderStatusChange(event: string, clientId?: string, orderNumber?: number) {
  try {
    const pushService = new PushService()
    
    if (event === "new_order") {
      const payload = {
        title: "🔔 Nuevo pedido recibido",
        body: "Ha llegado un nuevo pedido. Revísalo en el panel.",
        url: "/panel/orders",
      }
      await pushService.sendToRole("admin", payload)
      await pushService.sendToRole("rider", payload)
    } else if (clientId && orderNumber) {
      let title = ""
      let body = ""
      
      switch (event) {
        case "assigned":
          title = "Pedido aceptado ✅"
          body = `Tu pedido #${orderNumber} ha sido aceptado y está siendo preparado.`
          break
        case "on_the_way":
          title = "¡Tu pedido está en camino! 🚗"
          body = `Tu repartidor ya está llevando tu pedido #${orderNumber}.`
          break
        case "at_customer":
          title = "Tu repartidor ha llegado 📍"
          body = `Tu repartidor ha llegado a tu ubicación con el pedido #${orderNumber}.`
          break
        case "delivered":
          title = "¡Pedido entregado! 🎉"
          body = `Tu pedido #${orderNumber} ha sido entregado. ¡Buen provecho!`
          break
        case "cancelled":
          title = "Pedido cancelado ❌"
          body = `Tu pedido #${orderNumber} ha sido cancelado. Contáctanos si tienes dudas.`
          break
        default:
          return
      }
      
      await pushService.sendToUser(clientId, { title, body, url: "/" })
    }
  } catch (error) {
    console.error("[push] Error notifying order status change:", error)
  }
}

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

/**
 * Fetches a single order by its order_number (the URL-friendly identifier)
 * with all related data (items, store, rider, client profile).
 * Available to admins and riders (riders only see orders assigned to them).
 */
export async function getOrderByNumberWithDetails(
  orderNumber: number
): Promise<OrderWithClient | null> {
  const guard = await requireAdminOrRider()
  if (!guard.ok) return null

  const supabase = await createClient()
  const service = new OrdersService(supabase)
  const order = await service.getOrderByNumberWithDetails(orderNumber)
  if (!order) return null

  // Riders can only see their own assigned orders
  if (guard.role === "rider" && order.rider_id !== guard.userId) {
    return null
  }

  return order
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

  const result = await service.createOrder(params, profile.id)
  if (result.success) {
    notifyOrderStatusChange("new_order")
  }
  return result
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
  const res = await service.updateOrderStatus(orderId, status)
  // We only notify specific states via admin actions below, so this general function
  // might not need to trigger notifications unless specifically requested.
  // The specific functions (acceptOrder, startDelivery, etc.) will handle it.
  return res
}

export async function assignRider(
  orderId: string,
  riderId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const service = new OrdersService(supabase)
  const res = await service.assignRider(orderId, riderId)
  if (res.success && res.clientId && res.orderNumber) {
    notifyOrderStatusChange("assigned", res.clientId, res.orderNumber)
  }
  return res
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

async function requireAdminOrRider() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, error: "Usuario no autenticado" }
  }

  const role = user.app_metadata?.role
  if (role !== "admin" && role !== "rider") {
    return { ok: false as const, error: "No tienes permisos para acceder" }
  }

  return { ok: true as const, userId: user.id, role }
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
  const res = await service.assignRider(orderId, admin.userId)
  if (res.success && res.clientId && res.orderNumber) {
    notifyOrderStatusChange("assigned", res.clientId, res.orderNumber)
  }
  return res
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

  const res = await service.updateOrderStatus(orderId, "on_the_way")
  if (res.success && res.clientId && res.orderNumber) {
    notifyOrderStatusChange("on_the_way", res.clientId, res.orderNumber)
  }
  return res
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

  const res = await service.updateOrderStatus(orderId, "at_customer")
  if (res.success && res.clientId && res.orderNumber) {
    notifyOrderStatusChange("at_customer", res.clientId, res.orderNumber)
  }
  return res
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

  const res = await service.updateOrderStatus(orderId, "delivered")
  if (res.success && res.clientId && res.orderNumber) {
    notifyOrderStatusChange("delivered", res.clientId, res.orderNumber)
  }
  return res
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

/**
 * Cancelar pedido (admin): cambia status a 'cancelled'. Mantiene el rider_id
 * (preserva el audit trail de quién estaba asignado al momento de cancelar).
 * No se permite cancelar pedidos ya terminales (delivered, cancelled).
 */
export async function cancelOrderByAdmin(
  orderId: string
): Promise<{ success?: boolean; error?: string }> {
  const admin = await requireAdmin()
  if (!admin.ok) return { error: admin.error }

  const supabase = await createClient()
  const service = new OrdersService(supabase)

  const order = await service.getOrderById(orderId)
  if (!order) return { error: "Pedido no encontrado" }
  if (order.status === "delivered" || order.status === "cancelled") {
    return { error: "No se puede cancelar un pedido ya completado o cancelado" }
  }

  // rider_id se mantiene para audit trail
  const res = await service.updateOrderStatus(orderId, "cancelled")
  if (res.success && res.clientId && res.orderNumber) {
    notifyOrderStatusChange("cancelled", res.clientId, res.orderNumber)
  }
  return res
}