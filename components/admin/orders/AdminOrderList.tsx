"use client"

import { useState, useMemo } from "react"
import { Order, OrderStatus } from "@/lib/types"
import { AdminOrderFilters } from "./AdminOrderFilters"
import { AdminOrderRow } from "./AdminOrderRow"
import type { RiderProfile } from "@/lib/actions/orders"
import { toast } from "sonner"

interface AdminOrderListProps {
  initialOrders: Order[]
  riders: RiderProfile[]
}

function countByStatus(orders: Order[]): Record<OrderStatus | "all", number> {
  const counts: Record<string, number> = { all: orders.length }
  for (const order of orders) {
    counts[order.status] = (counts[order.status] ?? 0) + 1
  }
  return counts as Record<OrderStatus | "all", number>
}

export function AdminOrderList({ initialOrders, riders }: AdminOrderListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  const counts = useMemo(() => countByStatus(orders), [orders])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const { getAdminOrders } = await import("@/lib/actions/orders")
      const updated = await getAdminOrders()
      setOrders(updated)
      toast.success("Pedidos actualizados")
    } catch {
      toast.error("Error al actualizar pedidos")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-outline-variant p-8 text-center">
        <p className="text-body-md text-on-surface-variant">No hay pedidos registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AdminOrderFilters
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
          counts={counts}
        />
        <button
          onClick={handleRefresh}
          className={`text-label-md text-primary font-semibold hover:underline ${isRefreshing ? "opacity-50" : ""}`}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <AdminOrderRow
            key={order.id}
            order={order}
            riders={riders}
            onUpdated={handleRefresh}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && statusFilter !== "all" && (
        <p className="text-center py-8 text-body-md text-muted-foreground">
          No hay pedidos con estado &ldquo;{statusFilter}&rdquo;
        </p>
      )}
    </div>
  )
}