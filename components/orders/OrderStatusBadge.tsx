"use client"

import { OrderStatus } from "@/lib/types"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-900" },
  assigned: { label: "Asignado", className: "bg-blue-100 text-blue-900" },
  at_store: { label: "En tienda", className: "bg-purple-100 text-purple-900" },
  on_the_way: { label: "En camino", className: "bg-blue-100 text-blue-900" },
  delivered: { label: "Entregado", className: "bg-green-100 text-green-900" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-900" },
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  )
}