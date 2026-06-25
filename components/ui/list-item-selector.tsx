"use client"

import { useState } from "react"
import { ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface ListItemSelectorProps<T> {
  items: T[]
  selectedId: string | null
  onSelect: (item: T) => void
  renderItem: (item: T, isSelected: boolean) => React.ReactNode
  getItemId: (item: T) => string
  searchText?: (item: T) => string
  searchPlaceholder?: string
  showSearch?: boolean
  emptyMessage?: string
  footerAction?: React.ReactNode
  /** When true, render skeleton placeholders instead of items. */
  isLoading?: boolean
  /** Number of skeleton items to render when isLoading. Default 3. */
  skeletonCount?: number
}

export function ListItemSelector<T>({
  items,
  selectedId,
  onSelect,
  renderItem,
  getItemId,
  searchText,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  emptyMessage = "No hay opciones disponibles",
  footerAction,
  isLoading = false,
  skeletonCount = 3,
}: ListItemSelectorProps<T>) {
  const [search, setSearch] = useState("")

  const filteredItems = searchText
    ? items.filter((item) => {
        const haystack = searchText(item).toLowerCase()
        return haystack.includes(search.toLowerCase())
      })
    : items

  return (
    <div className="space-y-3">
      {showSearch && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Search className="size-4" />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-11 pr-4"
          />
        </div>
      )}

      {isLoading ? (
        <ul className="space-y-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <li
              key={`skeleton-${i}`}
              className="flex items-center gap-3 px-3 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest"
            >
              <div className="size-10 rounded-lg bg-outline-variant/40 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-outline-variant/40 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-outline-variant/40 animate-pulse" />
              </div>
              <div className="size-5 rounded-full bg-outline-variant/40 animate-pulse" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {filteredItems.length === 0 ? (
            <li className="py-6 text-center text-body-md text-muted-foreground">
              {emptyMessage}
            </li>
          ) : (
            filteredItems.map((item) => {
              const isSelected = getItemId(item) === selectedId
              return (
                <li key={getItemId(item)}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="w-full"
                  >
                    {renderItem(item, isSelected)}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}

      {footerAction && !isLoading && (
        <div className="pt-2 border-t border-outline-variant">
          {footerAction}
        </div>
      )}
    </div>
  )
}

export function ListItem({
  isSelected,
  children,
}: {
  isSelected: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all duration-150",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high hover:border-outline"
      )}
    >
      {children}
      <span
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ml-auto",
          isSelected
            ? "border-primary bg-primary"
            : "border-outline"
        )}
      >
        {isSelected && (
          <span className="w-2 h-2 rounded-full bg-on-primary" />
        )}
      </span>
    </div>
  )
}

export function ListItemContent({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
}) {
  return (
    <>
      {icon && (
        <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xl overflow-hidden">
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-on-surface truncate">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </>
  )
}

export function ListItemAction() {
  return (
    <span className="flex-shrink-0 text-muted-foreground">
      <ChevronRight className="size-5" />
    </span>
  )
}
