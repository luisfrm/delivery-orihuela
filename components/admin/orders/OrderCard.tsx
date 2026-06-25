"use client"

import { MapPin, Calendar, User, Check, Truck, X, CheckCircle } from "lucide-react"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { OrderActions } from "./OrderActions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/types"
import type { RiderProfile } from "@/lib/actions/orders"
import { formatCurrency, formatOrderDate } from "@/lib/orders/format"

interface OrderCardProps {
  order: Order
  riders: RiderProfile[]
  onViewDetails: (orderNumber: number) => void
  onAcceptOrder: (orderId: string) => void
  onStartDelivery: (orderId: string) => void
  onArriveAtCustomer: (orderId: string) => void
  onCompleteOrder: (orderId: string) => void
  onUnassignOrder: (orderId: string) => void
}

export function OrderCard({
  order,
  riders,
  onViewDetails,
  onAcceptOrder,
  onStartDelivery,
  onArriveAtCustomer,
  onCompleteOrder,
  onUnassignOrder,
}: OrderCardProps) {
  const getRiderName = (riderId: string | null) => {
    if (!riderId) return null
    const rider = riders.find((r) => r.id === riderId)
    return rider ? `${rider.first_name} ${rider.last_name}` : null
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3">
      {/* Header: ID + Status + Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-title-lg font-bold text-on-surface">
            #{order.order_number}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <OrderActions order={order} onViewDetails={onViewDetails}>
          {order.status === "pending" && (
            <DropdownMenuItem onClick={() => onAcceptOrder(order.id)}>
              <Check className="size-4" />
              Aceptar pedido
            </DropdownMenuItem>
          )}
          {order.status === "assigned" && (
            <>
              <DropdownMenuItem onClick={() => onStartDelivery(order.id)}>
                <Truck className="size-4 text-primary" />
                Iniciar entrega
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUnassignOrder(order.id)}
                className="text-warning focus:text-warning focus:bg-warning/10"
              >
                <X className="size-4 text-warning" />
                Desasignar
              </DropdownMenuItem>
            </>
          )}
          {order.status === "on_the_way" && (
            <DropdownMenuItem onClick={() => onArriveAtCustomer(order.id)}>
              <MapPin className="size-4 text-info" />
              Llegué al cliente
            </DropdownMenuItem>
          )}
          {order.status === "at_customer" && (
            <DropdownMenuItem
              onClick={() => onCompleteOrder(order.id)}
              className="text-success focus:text-success focus:bg-success/10"
            >
              <CheckCircle className="size-4 text-success" />
              Marcar completado
            </DropdownMenuItem>
          )}
        </OrderActions>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <Calendar className="size-4" />
        <span>{formatOrderDate(order.created_at)}</span>
      </div>

      {/* Client / Address */}
      <div className="space-y-1">
        <div className="font-medium text-body-md text-on-surface">
          {order.custom_store_name || order.pickup_reference || "Sin tienda"}
        </div>
        <div className="flex items-start gap-2 text-label-md text-on-surface-variant">
          <MapPin className="size-4 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {order.delivery_address_line || "Sin dirección de entrega"}
          </span>
        </div>
      </div>

      {/* Rider */}
      <div className="flex items-center gap-2 text-label-md">
        <User className="size-4 text-on-surface-variant" />
        {order.rider_id ? (
          <span className="text-on-surface">{getRiderName(order.rider_id)}</span>
        ) : (
          <span className="text-on-surface-variant italic">Sin asignar</span>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
        <span className="text-label-md text-on-surface-variant">Total</span>
        <span className="text-title-lg font-bold text-primary">
          {formatCurrency(order.total_amount)}
        </span>
      </div>
    </div>
  )
}
