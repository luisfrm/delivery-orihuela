"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { adminNavItems } from "./nav-items"

interface AdminNavContentProps {
  /**
   * Optional click handler fired when a nav item is activated.
   * The mobile drawer uses this to close itself after navigation.
   */
  onItemClick?: () => void
}

export function AdminNavContent({ onItemClick }: AdminNavContentProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-1" role="list">
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            role="listitem"
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group/nav relative flex items-center gap-3 rounded-lg px-4 py-3 text-body-md font-semibold tracking-tight transition-colors duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
            )}
          >
            {isActive && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
              />
            )}
            <Icon className="size-5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110" />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
