"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { OrdersTabs, type OrderTabFilter } from "./OrdersTabs"
import { OrdersDateFilter, type DateFilter } from "./OrdersDateFilter"
import { OrdersTable } from "./OrdersTable"
import { OrderCard } from "./OrderCard"
import { RefreshButton } from "@/components/shared/RefreshButton"
import { UsersLoadMore } from "@/components/admin/users/UsersLoadMore"
import type { Order, OrderStatus } from "@/lib/types"
import type { RiderProfile } from "@/lib/actions/orders"
import {
  acceptOrder,
  arriveAtCustomer,
  completeOrder,
  getAdminOrdersCounts,
  getAdminOrdersPage,
  startDelivery,
  unassignOrder,
} from "@/lib/actions/orders"

const TAB_STATUSES: Record<OrderTabFilter, OrderStatus[] | undefined> = {
  active: ["pending", "assigned", "at_customer", "on_the_way"],
  pending: ["pending"],
  in_progress: ["assigned", "on_the_way", "at_customer"],
  completed: ["delivered", "cancelled"],
}

type TabCache = Record<
  OrderTabFilter,
  { orders: Order[]; hasMore: boolean; total: number; loaded: boolean }
>

interface AdminOrdersManagerProps {
  initialOrders: Order[]
  initialHasMore: boolean
  initialCounts: { active: number; pending: number; in_progress: number; completed: number; total: number }
  initialTotal: number
  riders: RiderProfile[]
  pageSize: number
}

export function AdminOrdersManager({
  initialOrders,
  initialHasMore,
  initialCounts,
  initialTotal,
  riders,
  pageSize,
}: AdminOrdersManagerProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<OrderTabFilter>("active")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [cache, setCache] = useState<TabCache>({
    active: { orders: initialOrders, hasMore: initialHasMore, total: initialTotal, loaded: true },
    pending: { orders: [], hasMore: true, total: 0, loaded: false },
    in_progress: { orders: [], hasMore: true, total: 0, loaded: false },
    completed: { orders: [], hasMore: true, total: 0, loaded: false },
  })
  const [counts, setCounts] = useState(initialCounts)
  const [isLoading, setIsLoading] = useState(false)

  // Sincroniza SSR tras router.refresh
  useEffect(() => {
    setCache((prev) => ({
      ...prev,
      active: { orders: initialOrders, hasMore: initialHasMore, total: initialTotal, loaded: true },
    }))
    setCounts(initialCounts)
  }, [initialOrders, initialHasMore, initialTotal, initialCounts])

  const current = cache[selectedTab]
  const visibleOrders = current.orders
  const hasMore = current.hasMore
  const totalForTab = counts[selectedTab] ?? 0

  const fetchPage = useCallback(
    async (tab: OrderTabFilter, offset: number, replace: boolean, df: DateFilter) => {
      setIsLoading(true)
      try {
        const res = await getAdminOrdersPage({
          statuses: TAB_STATUSES[tab],
          offset,
          limit: pageSize,
          dateFilter: df,
        })
        setCache((prev) => ({
          ...prev,
          [tab]: {
            orders: replace ? res.orders : [...prev[tab].orders, ...res.orders],
            hasMore: res.hasMore,
            total: res.total,
            loaded: true,
          },
        }))
        // Actualiza count del tab con el total real de esa query (refleja dateFilter)
        setCounts((prev) => ({ ...prev, [tab]: res.total }))
      } catch {
        toast.error("Error al cargar pedidos")
      } finally {
        setIsLoading(false)
      }
    },
    [pageSize]
  )

  const fetchCounts = useCallback(
    async (df: DateFilter) => {
      try {
        const c = await getAdminOrdersCounts(df)
        setCounts(c)
        // Sincroniza totales en cache para hasMore coherente
        setCache((prev) => {
          const next = { ...prev }
          for (const k of Object.keys(next) as OrderTabFilter[]) {
            next[k] = { ...next[k], total: c[k] ?? next[k].total }
          }
          return next
        })
      } catch {
        // silente
      }
    },
    []
  )

  const handleTabChange = (tab: OrderTabFilter) => {
    if (tab === selectedTab) return
    setSelectedTab(tab)
    if (!cache[tab].loaded) {
      void fetchPage(tab, 0, true, dateFilter)
    }
  }

  const handleDateChange = (df: DateFilter) => {
    setDateFilter(df)
    // Resetea cache para todos los tabs porque el filtro de fecha cambia totales
    setCache({
      active: { orders: [], hasMore: true, total: 0, loaded: false },
      pending: { orders: [], hasMore: true, total: 0, loaded: false },
      in_progress: { orders: [], hasMore: true, total: 0, loaded: false },
      completed: { orders: [], hasMore: true, total: 0, loaded: false },
    })
    void fetchCounts(df)
    void fetchPage(selectedTab, 0, true, df)
  }

  const handleLoadMore = () => {
    void fetchPage(selectedTab, visibleOrders.length, false, dateFilter)
  }

  const refreshOrders = async () => {
    try {
      const c = await getAdminOrdersCounts(dateFilter)
      setCounts(c)
      const res = await getAdminOrdersPage({
        statuses: TAB_STATUSES[selectedTab],
        offset: 0,
        limit: Math.max(pageSize, visibleOrders.length || pageSize),
        dateFilter,
      })
      setCache((prev) => ({
        ...prev,
        [selectedTab]: { orders: res.orders, hasMore: res.hasMore, total: res.total, loaded: true },
      }))
    } catch {
      toast.error("Error al actualizar pedidos")
    }
  }

  const handleViewDetails = (orderNumber: number) => {
    router.push(`/panel/orders/${orderNumber}`)
  }

  const handleAcceptOrder = async (orderId: string) => {
    const result = await acceptOrder(orderId)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Pedido aceptado")
      await refreshOrders()
    }
  }

  const handleStartDelivery = async (orderId: string) => {
    const result = await startDelivery(orderId)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Entrega iniciada")
      await refreshOrders()
    }
  }

  const handleArriveAtCustomer = async (orderId: string) => {
    const result = await arriveAtCustomer(orderId)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Rider llegó al cliente")
      await refreshOrders()
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    const result = await completeOrder(orderId)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Pedido completado")
      await refreshOrders()
    }
  }

  const handleUnassignOrder = async (orderId: string) => {
    const result = await unassignOrder(orderId)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Pedido desasignado")
      await refreshOrders()
    }
  }

  const isEmptyTotal = counts.total === 0
  const isEmptyTab = !isEmptyTotal && visibleOrders.length === 0 && !isLoading

  // Carga inicial de counts con fecha "all" ya viene de SSR; si cambia dateFilter ya se recargó

  return (
    <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-low">
        <RefreshButton onRefresh={refreshOrders} />
      </div>

      <OrdersTabs selectedTab={selectedTab} onTabChange={handleTabChange} counts={counts} />

      {/* Date filter — solo desktop, pero afecta paginación */}
      <div className="hidden lg:block">
        <OrdersDateFilter value={dateFilter} onChange={handleDateChange} />
      </div>

      {/* Content */}
      {isLoading && visibleOrders.length === 0 ? (
        <div className="p-8 space-y-3">
          <div className="h-12 animate-pulse rounded-lg bg-surface-container" />
          <div className="h-12 animate-pulse rounded-lg bg-surface-container" />
          <div className="h-12 animate-pulse rounded-lg bg-surface-container" />
        </div>
      ) : isEmptyTotal ? (
        <div>
          <div className="hidden lg:block">
            <OrdersTable
              orders={[]}
              riders={riders}
              onViewDetails={handleViewDetails}
              onAcceptOrder={handleAcceptOrder}
              onStartDelivery={handleStartDelivery}
              onArriveAtCustomer={handleArriveAtCustomer}
              onCompleteOrder={handleCompleteOrder}
              onUnassignOrder={handleUnassignOrder}
            />
          </div>
          <div className="lg:hidden p-4 py-12 text-center">
            <p className="text-body-md text-on-surface-variant">No hay pedidos registrados</p>
          </div>
        </div>
      ) : isEmptyTab ? (
        <div className="p-12 text-center">
          <p className="text-body-md text-on-surface-variant">No hay pedidos en esta categoría</p>
        </div>
      ) : (
        <div>
          <div className="hidden lg:block">
            <OrdersTable
              orders={visibleOrders}
              riders={riders}
              onViewDetails={handleViewDetails}
              onAcceptOrder={handleAcceptOrder}
              onStartDelivery={handleStartDelivery}
              onArriveAtCustomer={handleArriveAtCustomer}
              onCompleteOrder={handleCompleteOrder}
              onUnassignOrder={handleUnassignOrder}
            />
          </div>
          <div className="lg:hidden p-4 space-y-3">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                riders={riders}
                onViewDetails={handleViewDetails}
                onAcceptOrder={handleAcceptOrder}
                onStartDelivery={handleStartDelivery}
                onArriveAtCustomer={handleArriveAtCustomer}
                onCompleteOrder={handleCompleteOrder}
                onUnassignOrder={handleUnassignOrder}
              />
            ))}
          </div>
          <UsersLoadMore
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={handleLoadMore}
            showing={visibleOrders.length}
            total={totalForTab}
            label="Ver más"
          />
        </div>
      )}
    </div>
  )
}
