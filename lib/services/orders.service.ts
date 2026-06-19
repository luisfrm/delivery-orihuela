import { Order, OrderItemWithProduct, OrderStatus, OrderWithDetails, ServiceType } from "@/lib/types"

export interface CreateOrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderParams {
  pickupReference: string
  storeId: string | null
  customStoreName: string | null
  customStoreAddress: string | null
  addressId: string
  additionalNotes: string | null
  deliveryFee: number
  serviceType?: ServiceType
  items?: CreateOrderItem[]
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

  async getUserOrdersWithDetails(userId: string): Promise<OrderWithDetails[]> {
    const orders = await this.getUserOrders(userId)
    if (orders.length === 0) return []

    const orderIds = orders.map((o) => o.id)
    const storeIds = Array.from(
      new Set(orders.map((o) => o.store_id).filter(Boolean))
    ) as string[]

    const [itemsRes, storesRes] = await Promise.all([
      this.supabase
        .from("order_items")
        .select("id, order_id, product_id, product_name, product_picture_url, quantity, estimated_unit_price")
        .in("order_id", orderIds),
      this.supabase
        .from("stores")
        .select("id, name")
        .in("id", storeIds),
    ])

    if (itemsRes.error) {
      console.error("Error fetching order items:", itemsRes.error)
    }
    if (storesRes.error) {
      console.error("Error fetching stores:", storesRes.error)
    }

    const itemsByOrder = new Map<string, OrderItemWithProduct[]>()
    for (const item of (itemsRes.data ?? []) as OrderItemWithProduct[]) {
      const list = itemsByOrder.get(item.order_id) ?? []
      list.push(item)
      itemsByOrder.set(item.order_id, list)
    }

    const storeById = new Map<string, string>(
      (storesRes.data ?? []).map((s) => [s.id, s.name])
    )

    return orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(order.id) ?? [],
      deliveryAddress:
        order.delivery_address_name && order.delivery_address_line
          ? {
              name: order.delivery_address_name,
              address_line: order.delivery_address_line,
            }
          : null,
      storeName: order.store_id ? storeById.get(order.store_id) ?? null : null,
    }))
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
      .select("name, address_line")
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

    const itemsEstimatedCost = (params.items ?? []).reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )
    const totalAmount = itemsEstimatedCost + params.deliveryFee

    const { data, error } = await this.supabase
      .from("orders")
      .insert({
        client_id: clientId,
        store_id: params.storeId,
        custom_store_name: params.customStoreName,
        custom_store_address: params.customStoreAddress,
        address_id: params.addressId,
        delivery_address_name: address.name,
        delivery_address_line: address.address_line,
        service_type: params.serviceType ?? "pickup_only",
        status: "pending",
        pickup_reference: params.pickupReference,
        additional_notes: params.additionalNotes,
        items_estimated_cost: itemsEstimatedCost,
        delivery_fee: params.deliveryFee,
        total_amount: totalAmount,
      })
      .select("id")
      .single()

    if (error) {
      return { error: error.message }
    }

    if (params.items && params.items.length > 0) {
      const productIds = params.items.map((i) => i.productId)
      const { data: products } = await this.supabase
        .from("products")
        .select("id, name, picture_url")
        .in("id", productIds)

      const productById = new Map(
        (products ?? []).map((p) => [p.id, p])
      )

      const orderItems = params.items.map((item) => {
        const product = productById.get(item.productId)
        return {
          order_id: data.id,
          product_id: item.productId,
          product_name: product?.name ?? null,
          product_picture_url: product?.picture_url ?? null,
          quantity: item.quantity,
          estimated_unit_price: item.unitPrice,
        }
      })

      const { error: itemsError } = await this.supabase
        .from("order_items")
        .insert(orderItems)

      if (itemsError) {
        console.error("Error creating order items:", itemsError)
      }
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

  async assignRider(orderId: string, riderId: string): Promise<{ success?: boolean; error?: string }> {
    const { error } = await this.supabase
      .from("orders")
      .update({ rider_id: riderId, status: "assigned" })
      .eq("id", orderId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }
}