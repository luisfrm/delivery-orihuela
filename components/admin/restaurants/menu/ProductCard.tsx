"use client"

import Image from "next/image"
import { Utensils } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  onClick?: () => void
  dragHandleRef?: (element: HTMLElement | null) => void
  isDragging?: boolean
  className?: string
}

export function ProductCard({
  product,
  onClick,
  dragHandleRef,
  isDragging,
  className,
}: ProductCardProps) {
  return (
    <button
      type="button"
      ref={dragHandleRef as React.Ref<HTMLButtonElement>}
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:p-4 transition-all hover:border-primary/60 disabled:opacity-50",
        isDragging && "opacity-40 cursor-grabbing",
        className
      )}
      disabled={isDragging}
    >
      <div className="flex gap-3 sm:gap-4 items-start">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
          {product.picture_url ? (
            <Image
              src={product.picture_url}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-on-surface-variant/40">
              <Utensils className="size-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-title-lg font-bold text-on-surface line-clamp-1">
              {product.name}
            </h4>
            <Badge variant="muted" className="shrink-0 px-2.5 py-0.5 text-label-md font-bold">
              {formatPriceCents(product.estimated_price)}
            </Badge>
          </div>
          {product.picture_url === null && product.description && (
            <p className="text-body-sm text-on-surface-variant line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
