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

  async getTopStoresChart(
    range: "week" | "month" | "all" = "month",
    limit = 6
  ): Promise<{ storeId: string; storeName: string; count: number; revenueCents: number }[]> {
    let gte: string | null = null
    if (range === "week") {
      const d = new Date()
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const start = new Date(d.setDate(diff))
      start.setHours(0, 0, 0, 0)
      gte = start.toISOString()
    } else if (range === "month") {
      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      gte = start.toISOString()
    }

    let query = this.serviceRole
      .from("orders")
      .select("store_id, total_amount, stores(name)")
      .not("store_id", "is", null)
      .eq("status", "delivered")
      .order("created_at", { ascending: false })
      .limit(500)

    if (gte) query = query.gte("created_at", gte)

    const { data, error } = await query
    if (error || !data) return []

    const map = new Map<string, { name: string; count: number; revenueCents: number }>()
    for (const row of data as unknown as { store_id: string; total_amount: number; stores: { name: string } | { name: string }[] | null }[]) {
      const id = row.store_id
      const storeName = Array.isArray(row.stores) ? row.stores[0]?.name ?? "Tienda" : row.stores?.name ?? "Tienda"
      const existing = map.get(id)
      const rev = Number(row.total_amount) || 0
      if (existing) {
        existing.count += 1
        existing.revenueCents += rev
      } else {
        map.set(id, { name: storeName, count: 1, revenueCents: rev })
      }
    }

    const arr = Array.from(map.entries()).map(([storeId, v]) => ({
      storeId,
      storeName: v.name,
      count: v.count,
      revenueCents: v.revenueCents,
    }))

    // Sort later by caller metric, default revenue for value
    return arr.sort((a, b) => b.revenueCents - a.revenueCents).slice(0, limit)
  }

  async getDailyOrders(days = 14): Promise<{ date: string; label: string; count: number }[]> {
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    start.setHours(0, 0, 0, 0)

    const { data, error } = await this.serviceRole
      .from("orders")
      .select("created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: true })
      .limit(1000)

    if (error || !data) return []

    const counts = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      counts.set(key, 0)
    }
    for (const row of data as { created_at: string }[]) {
      const key = row.created_at.slice(0, 10)
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const fmt = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" })
    return Array.from(counts.entries()).map(([date, count]) => ({
      date,
      label: fmt.format(new Date(date)),
      count,
    }))
  }
}
