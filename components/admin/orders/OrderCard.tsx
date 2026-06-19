"use client"

import { MapPin, Calendar, User } from "lucide-react"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { OrderActions } from "./OrderActions"
import type { Order } from "@/lib/types"
import type { RiderProfile } from "@/lib/actions/orders"
import { formatCurrency, formatOrderDate } from "@/lib/orders/format"

interface OrderCardProps {
  order: Order
  riders: RiderProfile[]
  onViewDetails: (orderId: string) => void
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
        <OrderActions
          order={order}
          onViewDetails={onViewDetails}
          onAcceptOrder={onAcceptOrder}
          onStartDelivery={onStartDelivery}
          onArriveAtCustomer={onArriveAtCustomer}
          onCompleteOrder={onCompleteOrder}
          onUnassignOrder={onUnassignOrder}
        />
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <Calendar className="size-4" />
        <span>{formatOrderDate(order.created_at)}</span>
      </div>

      {/* Client / Address */}
      <div className="space-y-1">
        <div className="font-medium text-body-md text-on-surface">
          {order.custom_store_name || "Cliente"}
        </div>
        <div className="flex items-start gap-2 text-label-md text-on-surface-variant">
          <MapPin className="size-4 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {order.custom_store_address || order.pickup_reference || "Sin dirección"}
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
