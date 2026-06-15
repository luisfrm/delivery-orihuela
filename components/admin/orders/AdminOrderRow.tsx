"use client"

import { useState } from "react"
import { Order, OrderStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ORDER_STATUS_CONFIG, SERVICE_TYPE_CONFIG } from "@/lib/orders/order-status"
import { formatCurrency, formatOrderDate } from "@/lib/orders/format"
import { updateOrderStatus, assignDriver } from "@/lib/actions/orders"
import type { RiderProfile } from "@/lib/actions/orders"
import { toast } from "sonner"
import { MapPin, Store, User, Clock, ChevronDown } from "lucide-react"

interface AdminOrderRowProps {
  order: Order
  riders: RiderProfile[]
  onUpdated: () => void
}

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "assigned",
  "at_store",
  "on_the_way",
  "delivered",
  "cancelled",
]

export function AdminOrderRow({ order, riders, onUpdated }: AdminOrderRowProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showRiderMenu, setShowRiderMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true)
    setShowStatusMenu(false)
    const result = await updateOrderStatus(order.id, newStatus)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Estado actualizado")
      onUpdated()
    }
    setIsUpdating(false)
  }

  const handleAssignRider = async (riderId: string) => {
    setIsUpdating(true)
    setShowRiderMenu(false)
    const result = await assignDriver(order.id, riderId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Rider asignado")
      onUpdated()
    }
    setIsUpdating(false)
  }

  const assignedRider = order.driver_id
    ? riders.find((r) => r.id === order.driver_id)
    : null

  const nextStatuses = STATUS_ORDER.filter(
    (s) => s !== "cancelled" && s !== order.status
  )

  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-surface-container transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-title-lg font-bold text-on-surface truncate">
                {order.pickup_reference || "Sin referencia"}
              </h3>
              <Badge variant={ORDER_STATUS_CONFIG[order.status].badgeVariant}>
                {ORDER_STATUS_CONFIG[order.status].label}
              </Badge>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-body-sm text-on-surface-variant flex-wrap">
              <span className="flex items-center gap-1">
                <Store className="size-4" />
                {order.custom_store_name ?? `Tienda #${order.store_id?.slice(0, 8) ?? "—"}`}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {order.client_id.slice(0, 8)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-headline-md font-bold text-primary">
                {formatCurrency(order.total_amount)}
              </p>
              <div className="flex items-center gap-1 text-label-md text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{formatOrderDate(order.created_at)}</span>
              </div>
            </div>
            <ChevronDown
              className={`size-5 text-on-surface-variant transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-outline-variant pt-3">
          {order.additional_notes && (
            <p className="text-body-sm text-on-surface-variant italic">
              Nota: &ldquo;{order.additional_notes}&rdquo;
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-body-sm">
            <div>
              <p className="text-label-md text-muted-foreground">Servicio</p>
              <p className="text-body-md font-medium text-on-surface">
                {SERVICE_TYPE_CONFIG[order.service_type].label}
              </p>
            </div>
            {order.custom_store_address && (
              <div>
                <p className="text-label-md text-muted-foreground">Dirección tienda</p>
                <p className="text-body-md font-medium text-on-surface">{order.custom_store_address}</p>
              </div>
            )}
            <div>
              <p className="text-label-md text-muted-foreground">ID Pedido</p>
              <p className="text-body-sm font-mono text-on-surface">{order.id}</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Cliente</p>
              <p className="text-body-sm font-mono text-on-surface">{order.client_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
            <div className="flex-1">
              <p className="text-label-md text-muted-foreground mb-1">Rider asignado</p>
              {assignedRider ? (
                <p className="text-body-md font-medium text-on-surface flex items-center gap-1">
                  <User className="size-4 text-primary" />
                  {assignedRider.first_name} {assignedRider.last_name}
                </p>
              ) : (
                <p className="text-body-sm text-muted-foreground">Sin asignar</p>
              )}
            </div>

            {order.status === "pending" && (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowRiderMenu(!showRiderMenu)
                  }}
                  disabled={isUpdating}
                >
                  Asignar rider
                </Button>

                {showRiderMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container rounded-xl shadow-lg border border-outline z-10 py-1 max-h-48 overflow-y-auto">
                    {riders.length === 0 ? (
                      <p className="px-3 py-2 text-body-sm text-muted-foreground">No hay riders</p>
                    ) : (
                      riders.map((rider) => (
                        <button
                          key={rider.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAssignRider(rider.id)
                          }}
                          className="w-full text-left px-3 py-2 text-body-sm hover:bg-surface-container-high transition-colors"
                        >
                          {rider.first_name} {rider.last_name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {order.status !== "delivered" && order.status !== "cancelled" && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowStatusMenu(!showStatusMenu)
                  }}
                  disabled={isUpdating}
                >
                  Cambiar estado
                </Button>

                {showStatusMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container rounded-xl shadow-lg border border-outline z-10 py-1">
                    {nextStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(status)
                        }}
                        className="w-full text-left px-3 py-2 text-body-sm hover:bg-surface-container-high transition-colors"
                      >
                        {ORDER_STATUS_CONFIG[status].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}