"use client"

import { Fragment, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  adminNavItems,
  navSectionLabels,
  type AdminNavItem,
  type NavSection,
} from "./nav-items"

interface AdminNavContentProps {
  /**
   * Optional click handler fired when a nav item is activated.
   * The mobile drawer uses this to close itself after navigation.
   */
  onItemClick?: () => void
}

type RenderEntry =
  | { type: "section"; section: NavSection; id: string }
  | { type: "item"; item: AdminNavItem; id: string; isActive: boolean }

export function AdminNavContent({ onItemClick }: AdminNavContentProps) {
  const pathname = usePathname()

  const entries = useMemo<RenderEntry[]>(() => {
    const result: RenderEntry[] = []
    let prevSection: NavSection | undefined
    for (const item of adminNavItems) {
      const isActive = pathname === item.href
      if (item.section && item.section !== prevSection) {
        result.push({
          type: "section",
          section: item.section,
          id: `${item.href}-section`,
        })
      }
      result.push({ type: "item", item, id: item.href, isActive })
      prevSection = item.section
    }
    return result
  }, [pathname])

  return (
    <div className="space-y-1" role="list">
      {entries.map((entry) => {
        if (entry.type === "section") {
          return (
            <h3
              key={entry.id}
              className="flex items-center px-4 pt-4 pb-1.5 text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant/70"
            >
              <span
                aria-hidden
                className="mr-2 inline-block size-1.5 rounded-full bg-primary"
              />
              {navSectionLabels[entry.section]}
            </h3>
          )
        }

        const { item, isActive } = entry
        const Icon = item.icon

        return (
          <Fragment key={entry.id}>
            <div
              className={cn(
                item.dividerAfter &&
                  "pb-1 border-b border-outline-variant/30 mb-1"
              )}
            >
              <Link
                href={item.href}
                onClick={onItemClick}
                role="listitem"
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group/nav relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-md font-semibold tracking-tight transition-all duration-200",
                  isActive
                    ? "bg-primary text-on-primary shadow-md shadow-primary/25"
                    : "text-on-surface hover:bg-surface-container-high/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-white/20"
                      : "group-hover/nav:bg-surface-container-high group-hover/nav:scale-110"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 transition-colors duration-200",
                      isActive ? "text-white" : item.iconClass
                    )}
                  />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
