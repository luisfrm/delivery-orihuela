"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { OrdersTabs, type OrderTabFilter } from "./OrdersTabs"
import { OrdersDateFilter, type DateFilter } from "./OrdersDateFilter"
import { OrdersTable } from "./OrdersTable"
import { OrderCard } from "./OrderCard"
import { createClient } from "@/lib/supabase/client"
import type { Order, OrderStatus } from "@/lib/types"
import type { RiderProfile } from "@/lib/actions/orders"
import {
  acceptOrder,
  startDelivery,
  arriveAtCustomer,
  completeOrder,
  unassignOrder,
  getActiveAdminOrders,
  getCompletedAdminOrders,
} from "@/lib/actions/orders"

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "assigned",
  "at_customer",
  "on_the_way",
]

interface AdminOrdersManagerProps {
  initialOrders: Order[]
  riders: RiderProfile[]
}

// Filtra pedidos por fecha de creación
function filterByDate(orders: Order[], dateFilter: DateFilter): Order[] {
  if (dateFilter === "all") return orders

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const orderDate = (order: Order) => new Date(order.created_at)

  switch (dateFilter) {
    case "today":
      return orders.filter((o) => orderDate(o) >= today)
    case "yesterday": {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return orders.filter((o) => {
        const d = orderDate(o)
        return d >= yesterday && d < today
      })
    }
    case "this_week": {
      const startOfWeek = new Date(today)
      const dayOfWeek = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      startOfWeek.setDate(diff)
      return orders.filter((o) => orderDate(o) >= startOfWeek)
    }
    case "this_month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return orders.filter((o) => orderDate(o) >= startOfMonth)
    }
    default:
      return orders
  }
}

// Mapea tabs a estados
function getOrdersForTab(orders: Order[], tab: OrderTabFilter): Order[] {
  switch (tab) {
    case "active":
      return orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
    case "pending":
      return orders.filter((o) => o.status === "pending")
    case "in_progress":
      return orders.filter((o) =>
        ["assigned", "on_the_way", "at_customer"].includes(o.status)
      )
    case "completed":
      return orders.filter((o) => o.status === "delivered" || o.status === "cancelled")
    default:
      return orders
  }
}

function countByTab(
  activeOrders: Order[],
  completedOrders: Order[]
): Record<OrderTabFilter, number> {
  return {
    active: activeOrders.length,
    pending: activeOrders.filter((o) => o.status === "pending").length,
    in_progress: activeOrders.filter((o) =>
      ["assigned", "on_the_way", "at_customer"].includes(o.status)
    ).length,
    completed: completedOrders.length,
  }
}

export function AdminOrdersManager({ initialOrders, riders }: AdminOrdersManagerProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [hasLoadedCompleted, setHasLoadedCompleted] = useState(false)
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false)
  const [selectedTab, setSelectedTab] = useState<OrderTabFilter>("active")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")

  // Carga diferida de pedidos completados al activar la tab "completed"
  useEffect(() => {
    if (selectedTab !== "completed") return
    if (hasLoadedCompleted || isLoadingCompleted) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingCompleted(true)
    getCompletedAdminOrders()
      .then((data) => {
        setCompletedOrders(data)
        setHasLoadedCompleted(true)
      })
      .catch(() => {
        toast.error("Error al cargar pedidos completados")
      })
      .finally(() => {
        setIsLoadingCompleted(false)
      })
  }, [selectedTab, hasLoadedCompleted, isLoadingCompleted])

  const sourceOrders = selectedTab === "completed" ? completedOrders : orders

  const dateFilteredOrders = useMemo(
    () => filterByDate(sourceOrders, dateFilter),
    [sourceOrders, dateFilter]
  )

  const filteredOrders = useMemo(
    () => getOrdersForTab(dateFilteredOrders, selectedTab),
    [dateFilteredOrders, selectedTab]
  )

  const counts = useMemo(
    () => countByTab(orders, completedOrders),
    [orders, completedOrders]
  )

  const refreshOrders = useCallback(async () => {
    try {
      const updated = await getActiveAdminOrders()
      setOrders(updated)
      if (hasLoadedCompleted) {
        const updatedCompleted = await getCompletedAdminOrders()
        setCompletedOrders(updatedCompleted)
      }
    } catch {
      toast.error("Error al actualizar pedidos")
    }
  }, [hasLoadedCompleted])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void refreshOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshOrders])

  const handleViewDetails = (orderId: string) => {
    router.push(`/panel/orders/${orderId}`)
  }

  const handleAcceptOrder = async (orderId: string) => {
    const result = await acceptOrder(orderId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Pedido aceptado")
      await refreshOrders()
    }
  }

  const handleStartDelivery = async (orderId: string) => {
    const result = await startDelivery(orderId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Entrega iniciada")
      await refreshOrders()
    }
  }

  const handleArriveAtCustomer = async (orderId: string) => {
    const result = await arriveAtCustomer(orderId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Rider llegó al cliente")
      await refreshOrders()
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    const result = await completeOrder(orderId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Pedido completado")
      await refreshOrders()
    }
  }

  const handleUnassignOrder = async (orderId: string) => {
    const result = await unassignOrder(orderId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Pedido desasignado")
      await refreshOrders()
    }
  }

  return (
    <div className="max-w-7xl rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
      <OrdersTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        counts={counts}
      />

      {/* Date filter — solo desktop */}
      <div className="hidden lg:block">
        <OrdersDateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Content */}
      {selectedTab === "completed" && isLoadingCompleted ? (
        <div className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <p className="text-body-md text-on-surface-variant">
              Cargando pedidos completados...
            </p>
          </div>
        </div>
      ) : orders.length === 0 &&
        completedOrders.length === 0 &&
        hasLoadedCompleted ? (
        <div>
          {/* Desktop: Table con empty state */}
          <div className="hidden lg:block">
            <OrdersTable
              orders={orders}
              riders={riders}
              onViewDetails={handleViewDetails}
              onAcceptOrder={handleAcceptOrder}
              onStartDelivery={handleStartDelivery}
              onArriveAtCustomer={handleArriveAtCustomer}
              onCompleteOrder={handleCompleteOrder}
              onUnassignOrder={handleUnassignOrder}
            />
          </div>

          {/* Mobile: Empty state */}
          <div className="lg:hidden p-4 py-12 text-center">
            <div className="mx-auto max-w-md">
              <p className="text-body-md text-on-surface-variant">
                No hay pedidos registrados
              </p>
            </div>
          </div>
        </div>
      ) : selectedTab === "completed" && !hasLoadedCompleted ? (
        <div className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <p className="text-body-md text-on-surface-variant">
              No hay pedidos en esta categoría
            </p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto max-w-md">
            <p className="text-body-md text-on-surface-variant">
              No hay pedidos en esta categoría
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Desktop: Table */}
          <div className="hidden lg:block">
            <OrdersTable
              orders={filteredOrders}
              riders={riders}
              onViewDetails={handleViewDetails}
              onAcceptOrder={handleAcceptOrder}
              onStartDelivery={handleStartDelivery}
              onArriveAtCustomer={handleArriveAtCustomer}
              onCompleteOrder={handleCompleteOrder}
              onUnassignOrder={handleUnassignOrder}
            />
          </div>

          {/* Mobile: Cards */}
          <div className="lg:hidden p-4 space-y-3">
            {filteredOrders.map((order) => (
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
        </div>
      )}
    </div>
  )
}
