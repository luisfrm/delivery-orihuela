"use client"

import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { getCategoryById } from "@/lib/restaurants/menu-categories"

interface AddProductCardProps {
  categorySlug: string
  onClick?: () => void
  className?: string
}

export function AddProductCard({
  categorySlug,
  onClick,
  className,
}: AddProductCardProps) {
  const category = getCategoryById(categorySlug)
  const label = category ? `Añadir plato a ${category.name}` : "Añadir plato"

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest/50 p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-lowest transition-all",
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
        <Plus className="size-5" />
      </div>
      <span className="text-label-lg font-semibold">{label}</span>
    </button>
  )
}
