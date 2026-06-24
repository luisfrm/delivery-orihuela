"use client"

import { cn } from "@/lib/utils"

export type UsersTabFilter = "staff" | "clients"

interface UsersTabsProps {
  selectedTab: UsersTabFilter
  onTabChange: (tab: UsersTabFilter) => void
  counts: Record<UsersTabFilter, number>
}

const TABS: { value: UsersTabFilter; label: string; description: string }[] = [
  {
    value: "staff",
    label: "Staff",
    description: "Admins y repartidores",
  },
  {
    value: "clients",
    label: "Clientes",
    description: "Usuarios registrados en la app",
  },
]

export function UsersTabs({ selectedTab, onTabChange, counts }: UsersTabsProps) {
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
            <span className="flex items-center gap-2">
              <span>{tab.label}</span>
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-label-md",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {counts[tab.value]}
              </span>
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
