"use client"

import { ChevronRight } from "lucide-react"

import { ScrollShadow } from "@/components/ui/scroll-shadow"
import { cn } from "@/lib/utils"
import { MENU_CATEGORIES } from "@/lib/restaurants/menu-categories"

interface MenuCategoryFilterProps {
  selectedCategory: string | null
  onSelect: (slug: string | null) => void
}

export function MenuCategoryFilter({
  selectedCategory,
  onSelect,
}: MenuCategoryFilterProps) {
  return (
    <ScrollShadow
      direction="x"
      className="pb-1"
      scrollClassName="flex items-center gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <span className="shrink-0 text-label-lg font-semibold text-on-surface-variant pr-1">
        Categorías:
      </span>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 px-4 py-1.5 text-label-lg font-semibold rounded-full transition-colors",
          selectedCategory === null
            ? "bg-primary text-on-primary border-2 border-primary"
            : "bg-surface-container text-on-surface border-2 border-transparent hover:bg-surface-container-high"
        )}
      >
        Todas
      </button>
      {MENU_CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 text-label-lg font-semibold rounded-full transition-colors",
              isActive
                ? "bg-primary text-on-primary border-2 border-primary"
                : "bg-surface-container text-on-surface border-2 border-transparent hover:bg-surface-container-high"
            )}
          >
            <cat.icon className="size-3.5" />
            {cat.name}
            {isActive && <ChevronRight className="size-3.5" />}
          </button>
        )
      })}
    </ScrollShadow>
  )
}
