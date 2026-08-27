import type { Order } from "@/lib/types"

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
type ServiceRoleClient = Awaited<ReturnType<typeof import("@/lib/supabase/service-role").createServiceRoleClient>>

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  activeOrders: number
  deliveredOrders: number
  cancelledOrders: number
  revenueCents: number
  todayOrders: number
  todayRevenueCents: number
  thisMonthOrders: number
  thisMonthDelivered: number
  thisMonthRevenueCents: number
  storeCount: number
  activeProductCount: number
  userCount: number
}

export interface RecentOrder {
  id: string
  order_number: number
  status: Order["status"]
  total_amount: number
  storeName: string | null
  created_at: string
}

export class DashboardService {
  constructor(
    private supabase: SupabaseClient,
    private serviceRole: ServiceRoleClient
  ) {}

  async getStats(): Promise<DashboardStats> {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [
      totalRes,
      pendingRes,
      activeRes,
      deliveredRes,
      cancelledRes,
      todayRes,
      thisMonthRes,
      thisMonthDeliveredRes,
      revenueRes,
      todayRevenueRes,
      thisMonthRevenueRes,
      storeRes,
      productRes,
      usersRes,
    ] = await Promise.all([
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "assigned", "at_customer", "on_the_way"]),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
      this.serviceRole.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered").gte("created_at", startOfMonth.toISOString()),
      this.serviceRole.from("orders").select("total_amount").eq("status", "delivered"),
      this.serviceRole.from("orders").select("total_amount").eq("status", "delivered").gte("created_at", startOfToday.toISOString()),
      this.serviceRole.from("orders").select("total_amount").eq("status", "delivered").gte("created_at", startOfMonth.toISOString()),
      this.serviceRole.from("stores").select("id", { count: "exact", head: true }),
      this.serviceRole.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      this.serviceRole.from("user_profiles").select("id", { count: "exact", head: true }),
    ])

    const revenueCents = (revenueRes.data ?? []).reduce((sum: number, r: { total_amount: number }) => sum + (Number(r.total_amount) || 0), 0)
    const todayRevenueCents = (todayRevenueRes.data ?? []).reduce((sum: number, r: { total_amount: number }) => sum + (Number(r.total_amount) || 0), 0)
    const thisMonthRevenueCents = (thisMonthRevenueRes.data ?? []).reduce((sum: number, r: { total_amount: number }) => sum + (Number(r.total_amount) || 0), 0)

    return {
      totalOrders: totalRes.count ?? 0,
      pendingOrders: pendingRes.count ?? 0,
      activeOrders: activeRes.count ?? 0,
      deliveredOrders: deliveredRes.count ?? 0,
      cancelledOrders: cancelledRes.count ?? 0,
      revenueCents,
      todayOrders: todayRes.count ?? 0,
      todayRevenueCents,
      thisMonthOrders: thisMonthRes.count ?? 0,
      thisMonthDelivered: thisMonthDeliveredRes.count ?? 0,
      thisMonthRevenueCents,
      storeCount: storeRes.count ?? 0,
      activeProductCount: productRes.count ?? 0,
      userCount: usersRes.count ?? 0,
    }
  }

  async getRecentOrders(limit = 5): Promise<RecentOrder[]> {
    const { data, error } = await this.serviceRole
      .from("orders")
      .select("id, order_number, status, total_amount, created_at, stores(name)")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      console.error("Error fetching recent orders:", error)
      return []
    }

    type Row = {
      id: string
      order_number: number
      status: Order["status"]
      total_amount: number
      created_at: string
      stores: { name: string } | { name: string }[] | null
    }

    return (data as unknown as Row[]).map((row) => ({
      id: row.id,
      order_number: row.order_number,
      status: row.status,
      total_amount: Number(row.total_amount) || 0,
      storeName: Array.isArray(row.stores) ? row.stores[0]?.name ?? null : row.stores?.name ?? null,
      created_at: row.created_at,
    }))
  }

  async getTopStores(limit = 3): Promise<{ storeId: string; storeName: string; count: number }[]> {
    const { data, error } = await this.serviceRole
      .from("orders")
      .select("store_id, stores(name)")
      .not("store_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error || !data) return []

    const counts = new Map<string, { name: string; count: number }>()
    for (const row of data as unknown as { store_id: string; stores: { name: string } | { name: string }[] | null }[]) {
      const id = row.store_id
      const storeName = Array.isArray(row.stores) ? row.stores[0]?.name ?? "Tienda" : row.stores?.name ?? "Tienda"
      const existing = counts.get(id)
      if (existing) existing.count += 1
      else counts.set(id, { name: storeName, count: 1 })
    }

    return Array.from(counts.entries())
      .map(([storeId, v]) => ({ storeId, storeName: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }
}
