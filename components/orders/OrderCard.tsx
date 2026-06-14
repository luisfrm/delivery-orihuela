"use client"

import { Order } from "@/lib/types"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { MapPin, Store, Calendar, Clock } from "lucide-react"

interface OrderCardProps {
  order: Order
  onClick?: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const storeName = order.store_id ? order.store_id : order.custom_store_name ?? "Establecimiento"
  const storeAddress = order.custom_store_address ?? null

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-container-low rounded-xl p-4 border border-outline-variant hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-title-lg font-bold text-on-surface truncate">
              {order.pickup_reference || "Sin referencia"}
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <Store className="size-4 flex-shrink-0 text-primary" />
              <span className="truncate">{storeName}</span>
            </div>

            {storeAddress && (
              <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                <MapPin className="size-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{storeAddress}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-headline-md font-bold text-primary">
            €{order.total_amount.toFixed(2)}
          </p>
          <div className="mt-1.5 space-y-0.5">
            <div className="flex items-center gap-1 text-label-md text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 text-label-md text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{formatTime(order.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {order.additional_notes && (
        <p className="mt-2 text-label-md text-on-surface-variant line-clamp-2 italic">
          &ldquo;{order.additional_notes}&rdquo;
        </p>
      )}
    </button>
  )
}