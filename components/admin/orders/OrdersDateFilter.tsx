"use client"

import { Select, type SelectOption } from "@/components/ui/select"

export type DateFilter = "all" | "today" | "yesterday" | "this_week" | "this_month"

const OPTIONS: SelectOption[] = [
  { value: "all", label: "Todos" },
  { value: "today", label: "Hoy" },
  { value: "yesterday", label: "Ayer" },
  { value: "this_week", label: "Esta semana" },
  { value: "this_month", label: "Este mes" },
]

interface OrdersDateFilterProps {
  value: DateFilter
  onChange: (value: DateFilter) => void
}

export function OrdersDateFilter({ value, onChange }: OrdersDateFilterProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
      <label className="text-body-md text-on-surface-variant whitespace-nowrap">
        Filtrar por fecha:
      </label>
      <Select
        options={OPTIONS}
        value={value}
        onChange={(v) => onChange(v as DateFilter)}
        placeholder="Todos"
        className="w-40"
      />
    </div>
  )
}
