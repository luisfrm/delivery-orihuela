"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Receipt, ChevronDown } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContactRiderActions } from "@/components/orders/ContactRiderActions"
import { cn } from "@/lib/utils"
import {
  ORDER_STATUS_CONFIG,
  SERVICE_TYPE_CONFIG,
} from "@/lib/orders/order-status"
import {
  formatCurrency,
  formatOrderDateOnly,
} from "@/lib/orders/format"
import type { ActiveOrderData } from "@/lib/types"

export interface ActiveOrderCardProps {
  order: ActiveOrderData
  className?: string
}

export function ActiveOrderCard({
  order,
  className,
}: ActiveOrderCardProps) {
  const [itemsExpanded, setItemsExpanded] = useState(true)
  const status = ORDER_STATUS_CONFIG[order.status]
  const service = SERVICE_TYPE_CONFIG[order.service_type]
  const StatusIcon = status.icon

  const title =
    order.custom_store_name ??
    order.storeName ??
    `Pedido #${order.order_number}`
  const hasRealTitle = title !== `Pedido #${order.order_number}`

  const itemsSubtotalCents = order.items.reduce(
    (sum, item) => sum + item.quantity * item.estimated_unit_price,
    0
  )
  const deliveryFeeCents = order.total_amount - itemsSubtotalCents

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
          {hasRealTitle
            ? `Pedido #${order.order_number} · ${formatOrderDateOnly(order.created_at)}`
            : formatOrderDateOnly(order.created_at)}
        </p>
      </div>

      {order.deliveryAddress && (
        <div className="flex items-start gap-3 text-on-surface-variant">
          <MapPin className="size-5 shrink-0 mt-0.5 text-primary" />
          <div>
            <p className="text-body-md font-medium text-on-surface">
              {order.deliveryAddress.name}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {order.deliveryAddress.address_line}
            </p>
          </div>
        </div>
      )}

      {order.items.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setItemsExpanded((v) => !v)}
            className="flex items-center justify-between w-full text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span>
              Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
            </span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                itemsExpanded && "rotate-180"
              )}
            />
          </button>
          {itemsExpanded && (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5"
                >
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-surface-container">
                    {item.product_picture_url ? (
                      <Image
                        src={item.product_picture_url}
                        alt={item.product_name ?? "Producto"}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-on-surface-variant/40 text-xs">
                        🍽
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-on-surface truncate">
                      {item.product_name ?? "Producto eliminado"}
                    </p>
                    <p className="text-label-md text-on-surface-variant">
                      ×{item.quantity}
                    </p>
                  </div>
                  <span className="text-body-sm font-semibold text-on-surface shrink-0">
                    {formatCurrency(item.quantity * item.estimated_unit_price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {order.additional_notes && (
        <div className="flex items-start gap-3 text-on-surface-variant">
          <Receipt className="size-5 shrink-0 mt-0.5" />
          <span className="text-body-sm italic line-clamp-3">
            {order.additional_notes}
          </span>
        </div>
      )}

      {order.items.length > 0 && (
        <div className="space-y-1.5 pt-3 border-t border-outline-variant/60">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface">
              {formatCurrency(itemsSubtotalCents)}
            </span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Costo de entrega</span>
            <span className="text-on-surface">
              {formatCurrency(deliveryFeeCents)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5">
            <span className="text-body-md font-semibold text-on-surface">
              Total
            </span>
            <span className="text-title-lg font-bold text-primary">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>
      )}

      {order.items.length === 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
          <span className="text-label-md text-on-surface-variant">Total</span>
          <span className="text-title-lg font-bold text-primary">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      )}

      {order.rider && (
        <div className="pt-3 border-t border-outline-variant/60">
          <ContactRiderActions rider={order.rider} />
        </div>
      )}
    </Card>
  )
}
