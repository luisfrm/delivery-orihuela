"use client"

import { cn } from "@/lib/utils"

export type OrderTabFilter = "active" | "pending" | "in_progress" | "completed"

interface OrdersTabsProps {
  selectedTab: OrderTabFilter
  onTabChange: (tab: OrderTabFilter) => void
  counts: Record<OrderTabFilter, number>
}

const TABS: { value: OrderTabFilter; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "pending", label: "Pendientes" },
  { value: "in_progress", label: "En camino" },
  { value: "completed", label: "Completados" },
]

export function OrdersTabs({ selectedTab, onTabChange, counts }: OrdersTabsProps) {
  return (
    <div className="flex items-center overflow-x-auto border-b border-outline-variant bg-surface-container-low">
      {TABS.map((tab) => {
        const isActive = selectedTab === tab.value
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "relative px-4 py-3 font-semibold whitespace-nowrap transition-colors",
              isActive
                ? "text-primary bg-surface-container-lowest"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/50"
            )}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={cn(
                  "ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-label-md",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {counts[tab.value]}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
