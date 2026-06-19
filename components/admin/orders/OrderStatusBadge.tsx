"use client"

import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"
import { ORDER_STATUS_CONFIG } from "@/lib/orders/order-status"

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-label-md font-semibold",
        status === "pending" && "bg-warning/10 text-warning",
        status === "assigned" && "bg-primary/10 text-primary",
        status === "at_customer" && "bg-secondary/10 text-secondary",
        status === "on_the_way" && "bg-info/10 text-info",
        status === "delivered" && "bg-success/10 text-success",
        status === "cancelled" && "bg-destructive/10 text-destructive",
        className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  )
}
