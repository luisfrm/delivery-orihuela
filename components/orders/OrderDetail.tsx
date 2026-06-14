"use client"

import { useState } from "react"
import { Order } from "@/lib/types"
import { OrderTimeline } from "./OrderTimeline"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { Button } from "@/components/ui/button"
import { MapPin, Store, Package, FileText, X, Calendar, Clock } from "lucide-react"

interface OrderDetailProps {
  order: Order
  onClose: () => void
  onCancel?: (orderId: string) => Promise<void>
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
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

export function OrderDetail({ order, onClose, onCancel }: OrderDetailProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  const canCancel = order.status === "pending"

  const handleCancel = async () => {
    if (!onCancel || !canCancel) return
    setIsCancelling(true)
    try {
      await onCancel(order.id)
      onClose()
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-headline-md font-bold text-on-surface">
              {order.pickup_reference || "Sin referencia"}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Pedido #{order.id.slice(0, 8)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
        >
          <X className="size-5 text-on-surface-variant" />
        </button>
      </div>

      <OrderTimeline status={order.status} />

      <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
        <div className="flex gap-3">
          <span className="flex-shrink-0 text-primary mt-0.5">
            <Store className="size-5" />
          </span>
          <div>
            <p className="text-label-md text-muted-foreground">Establecimiento</p>
            <p className="text-body-md font-medium text-on-surface">
              {order.store_id
                ? `Tienda #${order.store_id.slice(0, 8)}`
                : order.custom_store_name ?? "No especificado"}
            </p>
            {order.custom_store_address && (
              <p className="text-body-sm text-on-surface-variant">
                {order.custom_store_address}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex-shrink-0 text-primary mt-0.5">
            <MapPin className="size-5" />
          </span>
          <div>
            <p className="text-label-md text-muted-foreground">Dirección de entrega</p>
            <p className="text-body-sm text-on-surface-variant">
              {order.client_id.slice(0, 8)}
            </p>
          </div>
        </div>

        {order.additional_notes && (
          <div className="flex gap-3">
            <span className="flex-shrink-0 text-primary mt-0.5">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-label-md text-muted-foreground">Notas</p>
              <p className="text-body-md font-medium text-on-surface italic">
                &ldquo;{order.additional_notes}&rdquo;
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-outline-variant pt-3">
          <div className="space-y-2">
            <div className="flex justify-between text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Package className="size-4" />
                Costo de envío
              </span>
              <span>€{order.delivery_fee.toFixed(2)}</span>
            </div>
            {order.items_estimated_cost > 0 && (
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Productos estimados</span>
                <span>€{order.items_estimated_cost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-outline">
              <span className="text-title-lg font-bold text-on-surface">Total</span>
              <span className="text-headline-md font-bold text-primary">
                €{order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <Calendar className="size-4" />
        <span>{formatDate(order.created_at)}</span>
        <span className="mx-1">•</span>
        <Clock className="size-4" />
        <span>{formatTime(order.created_at)}</span>
      </div>

      {canCancel && (
        <Button
          variant="outline"
          size="lg"
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? "Cancelando..." : "Cancelar pedido"}
        </Button>
      )}
    </div>
  )
}