"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import { DashboardService, type DashboardStats, type RecentOrder } from "@/lib/services/dashboard.service"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: "No autenticado" }
  if (user.app_metadata?.role !== "admin") return { ok: false as const, error: "No autorizado" }
  return { ok: true as const, user }
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const guard = await requireAdmin()
  if (!guard.ok) return null
  const supabase = await createClient()
  const serviceRole = await createServiceRoleClient()
  const service = new DashboardService(supabase, serviceRole)
  return service.getStats()
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []
  const supabase = await createClient()
  const serviceRole = await createServiceRoleClient()
  const service = new DashboardService(supabase, serviceRole)
  return service.getRecentOrders(limit)
}

export async function getTopStores(limit = 3) {
  const guard = await requireAdmin()
  if (!guard.ok) return []
  const supabase = await createClient()
  const serviceRole = await createServiceRoleClient()
  const service = new DashboardService(supabase, serviceRole)
  return service.getTopStores(limit)
}

export async function getDashboardData() {
  const guard = await requireAdmin()
  if (!guard.ok) return null
  const supabase = await createClient()
  const serviceRole = await createServiceRoleClient()
  const service = new DashboardService(supabase, serviceRole)
  const [stats, recent, topStores] = await Promise.all([
    service.getStats(),
    service.getRecentOrders(5),
    service.getTopStores(3),
  ])
  return { stats, recent, topStores, adminName: guard.user.user_metadata?.first_name ?? guard.user.email?.split("@")[0] ?? "Admin" }
}
