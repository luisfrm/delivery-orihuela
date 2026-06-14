"use client"

import { OrderStatus } from "@/lib/types"

interface AdminOrderFiltersProps {
  selectedStatus: OrderStatus | "all"
  onStatusChange: (status: OrderStatus | "all") => void
  counts: Record<OrderStatus | "all", number>
}

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "assigned", label: "Asignado" },
  { value: "at_store", label: "En tienda" },
  { value: "on_the_way", label: "En camino" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
]

export function AdminOrderFilters({
  selectedStatus,
  onStatusChange,
  counts,
}: AdminOrderFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onStatusChange(option.value)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-label-md font-semibold transition-colors ${
            selectedStatus === option.value
              ? "bg-primary text-white"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {option.label}
          <span className="ml-1.5 opacity-70">({counts[option.value] ?? 0})</span>
        </button>
      ))}
    </div>
  )
}