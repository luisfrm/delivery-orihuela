"use client"

import { useState } from "react"
import { Eye, CheckCircle, Truck, MapPin, XCircle, UserCheck, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Order } from "@/lib/types"

interface OrderActionsProps {
  order: Order
  onViewDetails: (orderId: string) => void
  onAcceptOrder: (orderId: string) => void
  onStartDelivery: (orderId: string) => void
  onArriveAtCustomer: (orderId: string) => void
  onCompleteOrder: (orderId: string) => void
  onUnassignOrder: (orderId: string) => void
}

export function OrderActions({
  order,
  onViewDetails,
  onAcceptOrder,
  onStartDelivery,
  onArriveAtCustomer,
  onCompleteOrder,
  onUnassignOrder,
}: OrderActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: () => void) => {
    setIsOpen(false)
    action()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        aria-label="Acciones del pedido"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleAction(() => onViewDetails(order.id))}>
          <Eye className="size-4" />
          Ver detalles
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Acciones según estado */}
        {order.status === "pending" && (
          <DropdownMenuItem onClick={() => handleAction(() => onAcceptOrder(order.id))}>
            <UserCheck className="size-4" />
            Aceptar pedido
          </DropdownMenuItem>
        )}

        {order.status === "assigned" && (
          <>
            <DropdownMenuItem onClick={() => handleAction(() => onStartDelivery(order.id))}>
              <Truck className="size-4" />
              Iniciar entrega
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction(() => onUnassignOrder(order.id))}>
              <XCircle className="size-4" />
              Desasignar
            </DropdownMenuItem>
          </>
        )}

        {order.status === "on_the_way" && (
          <DropdownMenuItem onClick={() => handleAction(() => onArriveAtCustomer(order.id))}>
            <MapPin className="size-4" />
            Llegué al cliente
          </DropdownMenuItem>
        )}

        {order.status === "at_customer" && (
          <DropdownMenuItem onClick={() => handleAction(() => onCompleteOrder(order.id))}>
            <CheckCircle className="size-4" />
            Marcar completado
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
