"use client"

import { useState } from "react"
import { Home, Briefcase, MapPin, ListChecks } from "lucide-react"

import { ListCard } from "@/components/shared/ListCard"
import { Button } from "@/components/ui/button"
import { ContactRiderActions } from "@/components/orders/ContactRiderActions"
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { Tooltip } from "@/components/ui/tooltip"
import { ORDER_STATUS_CONFIG } from "@/lib/orders/order-status"
import {
  formatCurrency,
  formatOrderDate,
} from "@/lib/orders/format"
import { cn } from "@/lib/utils"
import type { OrderHistoryData } from "@/lib/types"

const VISIBLE_ITEMS = 5

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

function ItemRow({
  item,
}: {
  item: OrderHistoryData["items"][number]
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-body-sm">
      <span className="truncate flex-1 min-w-0">
        <span className="font-semibold">{item.quantity}x</span>{" "}
        {item.product_name ?? "Producto eliminado"}
      </span>
      <span className="text-on-surface-variant shrink-0">
        {formatCurrency(item.quantity * item.estimated_unit_price)}
      </span>
    </li>
  )
}

function FullItemsList({
  items,
}: {
  items: OrderHistoryData["items"]
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ul>
  )
}

export interface OrderHistoryListItemProps {
  order: OrderHistoryData
  className?: string
}

export function OrderHistoryListItem({
  order,
  className,
}: OrderHistoryListItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const status = ORDER_STATUS_CONFIG[order.status]
  const StatusIcon = status.icon
  const title =
    order.custom_store_name ??
    order.storeName ??
    `Pedido #${order.order_number}`

  const isCancelled = order.status === "cancelled"
  const hasItems = order.items.length > 0
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0)
  const visibleItems = order.items.slice(0, VISIBLE_ITEMS)
  const remaining = order.items.length - VISIBLE_ITEMS

  return (
    <>
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
          <>
            {hasItems ? (
              <div className="space-y-2">
                <h4 className="text-label-md font-semibold text-on-surface-variant">
                  Items ({totalItems})
                </h4>
                <ul className="space-y-1.5">
                  {visibleItems.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                </ul>
                {remaining > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-primary mt-1"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Ver {remaining} {remaining === 1 ? "item más" : "items más"}
                  </Button>
                )}
              </div>
            ) : null}
            {order.rider && (
              <div
                className={cn(
                  hasItems && "pt-3 mt-3 border-t border-outline-variant"
                )}
              >
                <ContactRiderActions rider={order.rider} />
              </div>
            )}
          </>
        }
        badge={{ label: status.label, variant: status.badgeVariant }}
        meta={
          <div className="flex justify-between items-center gap-3 pt-1">
            {order.deliveryAddress ? (
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-label-md text-label-md text-on-surface-variant truncate flex items-center gap-1">
                  {getAddressIconElement(
                    order.deliveryAddress.name,
                    "size-4 shrink-0"
                  )}
                  <span className="truncate">
                    {order.deliveryAddress.name}
                  </span>
                </span>
                <span className="text-label-md text-on-surface-variant/80 truncate pl-5">
                  {order.deliveryAddress.address_line}
                </span>
              </div>
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

      {hasItems && (
        <ResponsiveModal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ResponsiveModalContent
            icon={<ListChecks className="size-[18px]" />}
            title="Items del pedido"
            subtitle={`${order.items.length} ${order.items.length === 1 ? "producto" : "productos"}`}
            desktopMaxWidth="max-w-md"
          >
            <FullItemsList items={order.items} />
          </ResponsiveModalContent>
        </ResponsiveModal>
      )}
    </>
  )
}
