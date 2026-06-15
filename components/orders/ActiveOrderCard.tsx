import { MapPin, Receipt, MessageSquareText, ArrowRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ORDER_STATUS_CONFIG,
  SERVICE_TYPE_CONFIG,
} from "@/lib/orders/order-status"
import { formatCurrency, shortOrderId } from "@/lib/orders/format"
import type { Order } from "@/lib/types"

export interface ActiveOrderCardProps {
  order: Order
  onViewDetails?: (orderId: string) => void
  onContactDriver?: (orderId: string) => void
  className?: string
}

export function ActiveOrderCard({
  order,
  onViewDetails,
  onContactDriver,
  className,
}: ActiveOrderCardProps) {
  const status = ORDER_STATUS_CONFIG[order.status]
  const service = SERVICE_TYPE_CONFIG[order.service_type]
  const StatusIcon = status.icon

  const title = order.custom_store_name ?? `Pedido #${shortOrderId(order.id)}`
  const address = order.custom_store_address ?? order.pickup_reference

  return (
    <Card variant="active" className={cn("p-4 sm:p-6 gap-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={status.badgeVariant}
          className="rounded-full px-3 py-1 text-label-md gap-1.5"
        >
          <StatusIcon className="size-3.5" />
          {status.label}
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1 text-label-md">
          {service.label}
        </Badge>
      </div>

      <div>
        <h3 className="text-title-lg font-bold text-on-surface">{title}</h3>
        <p className="text-label-md text-on-surface-variant">
          Pedido #{shortOrderId(order.id)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {address && (
          <div className="flex items-start gap-3 text-on-surface-variant">
            <MapPin className="size-5 shrink-0 mt-0.5" />
            <span className="text-body-md">{address}</span>
          </div>
        )}
        {order.additional_notes && (
          <div className="flex items-start gap-3 text-on-surface-variant">
            <Receipt className="size-5 shrink-0 mt-0.5" />
            <span className="text-body-md line-clamp-2">
              {order.additional_notes}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
        <span className="text-label-md text-on-surface-variant">Total</span>
        <span className="text-title-lg font-bold text-primary">
          {formatCurrency(order.total_amount)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => onViewDetails?.(order.id)}
        >
          Ver detalles
          <ArrowRight />
        </Button>
        {order.driver_id && (
          <Button
            variant="tertiary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => onContactDriver?.(order.id)}
          >
            <MessageSquareText />
            Contactar repartidor
          </Button>
        )}
      </div>
    </Card>
  )
}