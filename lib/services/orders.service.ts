import { createServiceRoleClient } from "@/lib/supabase/service-role"
import {
  ClientContact,
  Order,
  OrderItemWithProduct,
  OrderStatus,
  OrderWithClient,
  OrderWithDetails,
  RiderContact,
  ServiceType,
} from "@/lib/types"

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
    const riderIds = Array.from(
      new Set(orders.map((o) => o.rider_id).filter(Boolean))
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

    // Fetch rider profiles using service role (RLS only allows viewing own
    // profile, so we need to bypass it to fetch the riders assigned to
    // the caller's orders).
    const ridersById = new Map<string, RiderContact>()
    if (riderIds.length > 0) {
      const serviceSupabase = await createServiceRoleClient()
      const { data: riders, error: ridersError } = await serviceSupabase
        .from("user_profiles")
        .select("id, first_name, last_name, phone")
        .in("id", riderIds)

      if (ridersError) {
        console.error("Error fetching riders:", ridersError)
      }

      for (const r of riders ?? []) {
        ridersById.set(r.id, {
          id: r.id,
          first_name: r.first_name ?? "",
          last_name: r.last_name ?? "",
          phone: r.phone ?? "",
        })
      }
    }

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
      rider: order.rider_id ? ridersById.get(order.rider_id) ?? null : null,
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

  /**
   * Fetches an order (looked up by order_number) with all related data:
   * items, store name, rider, and the client's profile + email.
   * Uses the service role client to bypass RLS on user_profiles and
   * auth.admin.getUserById for the email.
   */
  async getOrderByNumberWithDetails(
    orderNumber: number
  ): Promise<OrderWithClient | null> {
    const serviceSupabase = await createServiceRoleClient()

    const { data: order, error } = await serviceSupabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single()

    if (error || !order) {
      return null
    }

    const [itemsRes, storeRes, riderProfileRes, clientProfileRes] =
      await Promise.all([
        serviceSupabase
          .from("order_items")
          .select(
            "id, order_id, product_id, product_name, product_picture_url, quantity, estimated_unit_price"
          )
          .eq("order_id", order.id),
        order.store_id
          ? serviceSupabase
              .from("stores")
              .select("id, name")
              .eq("id", order.store_id)
              .single()
          : Promise.resolve({ data: null, error: null }),
        order.rider_id
          ? serviceSupabase
              .from("user_profiles")
              .select("id, first_name, last_name, phone")
              .eq("id", order.rider_id)
              .single()
          : Promise.resolve({ data: null, error: null }),
        serviceSupabase
          .from("user_profiles")
          .select("id, first_name, last_name, phone")
          .eq("id", order.client_id)
          .single(),
      ])

    let rider: RiderContact | null = null
    if (riderProfileRes.data) {
      const r = riderProfileRes.data
      rider = {
        id: r.id,
        first_name: r.first_name ?? "",
        last_name: r.last_name ?? "",
        phone: r.phone ?? "",
      }
    }

    let client: ClientContact | null = null
    if (clientProfileRes.data) {
      const c = clientProfileRes.data
      let email = ""
      try {
        const { data: authData } =
          await serviceSupabase.auth.admin.getUserById(c.id)
        email = authData?.user?.email ?? ""
      } catch {
        // email is optional; ignore
      }
      client = {
        id: c.id,
        first_name: c.first_name ?? "",
        last_name: c.last_name ?? "",
        phone: c.phone ?? "",
        email,
      }
    }

    return {
      ...order,
      items: (itemsRes.data ?? []) as OrderItemWithProduct[],
      deliveryAddress:
        order.delivery_address_name && order.delivery_address_line
          ? {
              name: order.delivery_address_name,
              address_line: order.delivery_address_line,
            }
          : null,
      storeName: order.store_id
        ? storeRes.data?.name ?? null
        : null,
      rider,
      client,
    }
  }

  async getAdminOrders(statuses?: OrderStatus[]): Promise<Order[]> {
    let query = this.supabase
      .from("orders")
      .select("*, stores(name)")
      .order("created_at", { ascending: false })

    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching admin orders:", error)
      return []
    }

    type Row = Order & { stores: { name: string } | null }
    return ((data || []) as Row[]).map((row) => ({
      ...row,
      storeName: row.stores?.name ?? null,
    }))
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

    if (!params.storeId && params.customStoreName && params.customStoreAddress) {
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