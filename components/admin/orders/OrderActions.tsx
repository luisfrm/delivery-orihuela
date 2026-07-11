"use client"

import { Eye, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/types"
import { Children, type ReactNode } from "react"

interface OrderActionsProps {
  order: Order
  onViewDetails: (orderNumber: number) => void
  children?: ReactNode
}

export function OrderActions({ order, onViewDetails, children }: OrderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onViewDetails(order.order_number)}
        title="Ver detalles"
        aria-label="Ver detalles del pedido"
      >
        <Eye className="size-4" />
      </Button>
      {Children.toArray(children).length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Más acciones del pedido"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
