"use client"

import { Home, Briefcase, MapPin } from "lucide-react"

import { ListCard } from "@/components/shared/ListCard"
import { Tooltip } from "@/components/ui/tooltip"
import { ORDER_STATUS_CONFIG } from "@/lib/orders/order-status"
import {
  formatCurrency,
  formatOrderDate,
  shortOrderId,
} from "@/lib/orders/format"
import { cn } from "@/lib/utils"
import type { OrderHistoryData } from "@/lib/types"

const VISIBLE_ITEMS = 3

function formatItemsSummary(
  items: OrderHistoryData["items"]
): string {
  return items
    .map(
      (i) => `${i.quantity}x ${i.product_name ?? "Producto eliminado"}`
    )
    .join(", ")
}

function getAddressIconElement(name: string, className: string) {
  const lower = name.toLowerCase()
  if (lower.includes("casa") || lower.includes("hogar")) {
    return <Home className={className} />
  }
  if (lower.includes("oficina") || lower.includes("trabajo")) {
    return <Briefcase className={className} />
  }
  return <MapPin className={className} />
}

export interface OrderHistoryListItemProps {
  order: OrderHistoryData
  className?: string
}

export function OrderHistoryListItem({
  order,
  className,
}: OrderHistoryListItemProps) {
  const status = ORDER_STATUS_CONFIG[order.status]
  const StatusIcon = status.icon
  const title =
    order.custom_store_name ??
    order.storeName ??
    `Pedido #${shortOrderId(order.id)}`

  const isCancelled = order.status === "cancelled"
  const fullItemsText = formatItemsSummary(order.items)
  const visibleItems = order.items.slice(0, VISIBLE_ITEMS)
  const remaining = order.items.length - VISIBLE_ITEMS
  const visibleText = formatItemsSummary(visibleItems)

  return (
    <ListCard
      className={cn(
        "transition-shadow hover:shadow-md",
        isCancelled && "opacity-75 grayscale-[0.2]",
        className
      )}
      icon={
        <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center text-primary">
          <StatusIcon className="size-6" />
        </div>
      }
      title={
        <Tooltip content={title}>
          <span className="truncate block cursor-default max-w-full">
            {title}
          </span>
        </Tooltip>
      }
      subtitle={formatOrderDate(order.created_at)}
      description={
        remaining > 0 ? (
          <Tooltip
            content={
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="text-label-md flex justify-between gap-3"
                  >
                    <span className="truncate">
                      <span className="font-semibold">{item.quantity}x</span>{" "}
                      {item.product_name ?? "Producto eliminado"}
                    </span>
                  </li>
                ))}
              </ul>
            }
          >
            <span className="truncate block cursor-default">
              {visibleText}{" "}
              <span className="text-on-surface-variant">
                +{remaining} más…
              </span>
            </span>
          </Tooltip>
        ) : (
          <span className="truncate block">{fullItemsText}</span>
        )
      }
      badge={{ label: status.label, variant: status.badgeVariant }}
      meta={
        <div className="flex justify-between items-center gap-3 pt-1">
          {order.deliveryAddress ? (
            <span className="font-label-md text-label-md text-on-surface-variant truncate flex items-center gap-1 min-w-0">
              {getAddressIconElement(
                order.deliveryAddress.name,
                "size-4 shrink-0"
              )}
              <span className="truncate">
                {order.deliveryAddress.name}
              </span>
            </span>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "font-headline-md text-headline-md shrink-0",
              isCancelled
                ? "text-on-surface line-through"
                : "text-on-surface"
            )}
          >
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      }
    />
  )
}
