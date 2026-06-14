import { Order, OrderStatus, ServiceType } from "@/lib/types"

export interface CreateOrderParams {
  pickupReference: string
  storeId: string | null
  customStoreName: string | null
  customStoreAddress: string | null
  addressId: string
  additionalNotes: string | null
  deliveryFee: number
  serviceType?: ServiceType
}

export interface OrderResult {
  success?: boolean
  error?: string
  orderId?: string
}

export class OrdersService {
  constructor(private supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {}

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from("orders")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user orders:", error)
      return []
    }

    return data || []
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (error) {
      return null
    }

    return data
  }

  async getAdminOrders(): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching admin orders:", error)
      return []
    }

    return data || []
  }

  async createOrder(params: CreateOrderParams, clientId: string): Promise<OrderResult> {
    const { data: address } = await this.supabase
      .from("user_addresses")
      .select("address_line")
      .eq("id", params.addressId)
      .single()

    if (!address) {
      return { error: "Dirección no encontrada" }
    }

    if (params.customStoreName && params.customStoreAddress) {
      await this.supabase.from("custom_stores").insert({
        name: params.customStoreName,
        address: params.customStoreAddress,
        suggested_by: clientId,
      })
    }

    const { data, error } = await this.supabase
      .from("orders")
      .insert({
        client_id: clientId,
        store_id: params.storeId,
        custom_store_name: params.customStoreName,
        custom_store_address: params.customStoreAddress,
        service_type: params.serviceType ?? "pickup_only",
        status: "pending",
        pickup_reference: params.pickupReference,
        additional_notes: params.additionalNotes,
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

  async cancelOrder(orderId: string, clientId: string): Promise<{ success?: boolean; error?: string }> {
    const { error } = await this.supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .eq("client_id", clientId)
      .eq("status", "pending")

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success?: boolean; error?: string }> {
    const { error } = await this.supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }

  async assignDriver(orderId: string, driverId: string): Promise<{ success?: boolean; error?: string }> {
    const { error } = await this.supabase
      .from("orders")
      .update({ driver_id: driverId, status: "assigned" })
      .eq("id", orderId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }
}