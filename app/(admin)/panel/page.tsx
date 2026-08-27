/* Hallmark · macrostructure: Bento Dashboard · tone: utilitarian · anchor hue: warm */
import Link from "next/link"
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  Store,
  UtensilsCrossed,
  ArrowUpRight,
  ChefHat,
  Wallet,
  Timer,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  CalendarDays,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import { getDashboardData } from "@/lib/actions/dashboard"
import { getOrganizationSettings } from "@/lib/actions/organization"
import { ORDER_STATUS_CONFIG } from "@/lib/orders/order-status"
import { TopRestaurantsChart } from "@/components/admin/dashboard/TopRestaurantsChart"
import { DailyOrdersChart } from "@/components/admin/dashboard/DailyOrdersChart"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [dashboard, org] = await Promise.all([getDashboardData(), getOrganizationSettings()])
  const stats = dashboard?.stats
  const recent = dashboard?.recent ?? []
  const topStores = dashboard?.topStores ?? []
  const topChart = dashboard?.topChart ?? []
  const daily = dashboard?.daily ?? []
  const adminName = dashboard?.adminName ?? "Admin"

  const now = new Date()
  const dateLong = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now)
  const monthLabel = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(now)
  const hasData = (stats?.totalOrders ?? 0) > 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero — mobile: stack, desktop: row */}
      <Card variant="surface" className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
                <span className="size-2 rounded-full bg-primary animate-pulse" aria-hidden />
                <span className="font-semibold tracking-wide">PANEL OPERATIVO</span>
                <span className="hidden sm:inline opacity-40">·</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 capitalize">
                  <CalendarDays className="size-3.5" />
                  {dateLong}
                </span>
              </div>
              <CardTitle className="text-[22px] leading-none tracking-tight sm:text-[24px] lg:text-[28px]">
                Hola, {adminName}
              </CardTitle>
              <CardDescription className="text-body-sm max-w-[560px] leading-snug">
                {org.name} · {org.tagline || "Delivery Orihuela"} —{" "}
                {hasData
                  ? `hoy ${stats?.todayOrders ?? 0} pedidos · ${stats?.pendingOrders ?? 0} pendientes`
                  : "sin pedidos aún, listo para el primero"}
              </CardDescription>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
              <Button nativeButton={false} render={<Link href="/panel/orders" />} variant="primary" size="default" className="w-full sm:w-auto">
                <Clock className="size-4" />
                Ver pedidos
                <ArrowUpRight className="size-4 hidden sm:inline-flex" />
              </Button>
              <Button nativeButton={false} render={<Link href="/panel/restaurants" />} variant="outline_primary" size="default" className="w-full sm:w-auto">
                <Store className="size-4" />
                Restaurantes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 divide-y divide-outline-variant/30 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-4 py-3 sm:px-5">
              <p className="text-label-md text-on-surface-variant">Hoy</p>
              <p className="text-body-md font-bold text-on-surface mt-0.5">
                {stats?.todayOrders ?? 0} <span className="font-normal text-on-surface-variant">pedidos</span>
              </p>
            </div>
            <div className="px-4 py-3 sm:px-5">
              <p className="text-label-md text-on-surface-variant">Ingresos hoy</p>
              <p className="text-body-md font-bold text-on-surface mt-0.5">{formatPriceCents(stats?.todayRevenueCents ?? 0)}</p>
            </div>
            <div className="px-4 py-3 sm:px-5">
              <p className="text-label-md text-on-surface-variant">Ticket medio</p>
              <p className="text-body-md font-bold text-on-surface mt-0.5">
                {stats && stats.deliveredOrders > 0 ? formatPriceCents(Math.round(stats.revenueCents / stats.deliveredOrders)) : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs — 4 principales, padding via CardHeader/Content, iconos no flotantes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pedidos este mes — mensual como pediste */}
        <Card variant="surface">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-on-primary">
                <ShoppingCart className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-[13px] font-semibold tracking-wide text-on-surface-variant">PEDIDOS · ESTE MES</CardTitle>
                <p className="text-label-md text-on-surface-variant capitalize">{monthLabel}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[30px] font-bold leading-none tracking-tight text-on-surface">{stats?.thisMonthOrders ?? 0}</p>
            <p className="mt-1.5 text-label-md text-on-surface-variant">
              {stats?.totalOrders ?? 0} totales históricos
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-label-md text-on-surface-variant">
              <span className="size-1.5 rounded-full bg-primary" />
              {stats?.pendingOrders ?? 0} pendientes
            </div>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                <Timer className="size-5" />
              </div>
              <div>
                <CardTitle className="text-[13px] font-semibold tracking-wide text-on-surface-variant">EN CURSO</CardTitle>
                <CardDescription className="text-label-md">Activos ahora</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[30px] font-bold leading-none tracking-tight text-on-surface">{stats?.activeOrders ?? 0}</p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-label-md text-on-surface-variant">
              {stats?.pendingOrders ? (
                <>
                  <AlertCircle className="size-3.5 text-amber-600" />
                  {stats.pendingOrders} por asignar
                </>
              ) : (
                "Sin pendientes"
              )}
            </p>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-on-primary">
                <Wallet className="size-5" />
              </div>
              <div>
                <CardTitle className="text-[13px] font-semibold tracking-wide text-on-surface-variant">INGRESOS · ESTE MES</CardTitle>
                <CardDescription className="text-label-md capitalize">{monthLabel}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[22px] font-bold leading-none tracking-tight text-on-surface">{formatPriceCents(stats?.thisMonthRevenueCents ?? 0)}</p>
            <p className="mt-1.5 text-label-md text-on-surface-variant">Total histórico {formatPriceCents(stats?.revenueCents ?? 0)}</p>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                <CheckCircle className="size-5" />
              </div>
              <div>
                <CardTitle className="text-[13px] font-semibold tracking-wide text-on-surface-variant">ENTREGADOS · MES</CardTitle>
                <CardDescription className="text-label-md">{stats?.deliveredOrders ?? 0} totales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[30px] font-bold leading-none tracking-tight text-on-surface">{stats?.thisMonthDelivered ?? 0}</p>
            <p className="mt-1.5 text-label-md text-on-surface-variant">{stats?.cancelledOrders ?? 0} cancelados totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias — V2: Top 6 + evolución diaria (recharts) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopRestaurantsChart initialData={topChart} />
        <DailyOrdersChart initialData={daily} />
      </div>

      {/* Secundaria */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card variant="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-label-lg flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                <Store className="size-4" />
              </span>
              Restaurantes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold leading-none">{stats?.storeCount ?? 0}</p>
            <p className="text-label-md text-on-surface-variant mt-1">{stats?.activeProductCount ?? 0} platos activos</p>
          </CardContent>
        </Card>
        <Card variant="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-label-lg flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                <Users className="size-4" />
              </span>
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold leading-none">{stats?.userCount ?? 0}</p>
            <p className="text-label-md text-on-surface-variant mt-1">Registrados</p>
          </CardContent>
        </Card>
        <Card variant="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-label-lg flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                <TrendingUp className="size-4" />
              </span>
              Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold leading-none">{stats?.todayOrders ?? 0}</p>
            <p className="text-label-md text-on-surface-variant mt-1">{formatPriceCents(stats?.todayRevenueCents ?? 0)} hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Bento */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card variant="surface" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <Clock className="size-4 text-primary" />
                Últimos pedidos
              </CardTitle>
              <Button nativeButton={false} render={<Link href="/panel/orders" />} variant="ghost" size="sm">
                Ver todos
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low/50">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-6" />
                </div>
                <p className="mt-3 text-body-md font-medium text-on-surface">Aún no hay pedidos</p>
                <p className="text-body-sm text-on-surface-variant mt-1">Cuando entre el primero, aparecerá aquí al instante.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((o) => {
                  const cfg = ORDER_STATUS_CONFIG[o.status]
                  const Icon = cfg.icon
                  return (
                    <li key={o.id} className="flex items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-semibold truncate">
                          #{o.order_number} · {o.storeName ?? "Pedido personalizado"}
                        </p>
                        <p className="text-label-md text-on-surface-variant">{new Date(o.created_at).toLocaleString("es-ES")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-body-sm font-bold">{formatPriceCents(o.total_amount)}</p>
                        <Badge variant={cfg.badgeVariant as never} className="mt-1">
                          {cfg.label}
                        </Badge>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card variant="surface">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[15px]">
                <ChefHat className="size-4 text-primary" />
                Top restaurantes
              </CardTitle>
              <CardDescription>Por volumen de pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              {topStores.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant py-6 text-center">Sin datos aún</p>
              ) : (
                <ul className="space-y-3">
                  {topStores.map((s, i) => (
                    <li key={s.storeId} className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-label-md font-bold">
                        {s.storeName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-medium truncate">{s.storeName}</p>
                        <p className="text-label-md text-on-surface-variant">{s.count} pedidos</p>
                      </div>
                      <span className="text-label-md font-bold text-primary">#{i + 1}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Acciones rápidas — padding corregido con CardHeader/Content */}
          <Card className="overflow-hidden border-transparent bg-primary text-on-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-on-primary">
                <Store className="size-4" />
                Acciones rápidas
              </CardTitle>
              <CardDescription className="text-on-primary/80">Atajos a lo que más usas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button nativeButton={false} render={<Link href="/panel/restaurants" />} variant="secondary" size="default" className="w-full justify-start bg-white text-primary hover:bg-white/90">
                <UtensilsCrossed className="size-4" />
                Nuevo restaurante
              </Button>
              <Button nativeButton={false} render={<Link href="/panel/users" />} variant="outline" size="default" className="w-full justify-start border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Users className="size-4" />
                Gestionar usuarios
              </Button>
              <Button nativeButton={false} render={<Link href="/panel/settings" />} variant="outline" size="default" className="w-full justify-start border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <SettingsIcon className="size-4" />
                Configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
