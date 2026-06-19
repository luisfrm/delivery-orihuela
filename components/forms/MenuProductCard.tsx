"use client"

import Image from "next/image"
import { Minus, Plus, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import type { Product } from "@/lib/types"

interface MenuProductCardProps {
  product: Product
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}

export function MenuProductCard({
  product,
  quantity,
  onIncrement,
  onDecrement,
}: MenuProductCardProps) {
  return (
    <div
      className={cn(
        "flex gap-3 items-start rounded-xl border border-outline-variant bg-surface-container-lowest p-3 transition-all",
        quantity > 0 && "border-primary bg-primary/5"
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container">
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
          <h4 className="text-body-md font-semibold text-on-surface line-clamp-1">
            {product.name}
          </h4>
          <Badge variant="muted" className="shrink-0 px-2.5 py-0.5 text-label-md font-bold">
            {formatPriceCents(product.estimated_price)}
          </Badge>
        </div>
        {product.description && (
          <p className="text-body-sm text-on-surface-variant line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex justify-end pt-1">
          {quantity === 0 ? (
            <Button
              type="button"
              variant="outline_primary"
              size="sm"
              onClick={onIncrement}
              className="h-8 px-3"
            >
              <Plus className="size-3.5" />
              Agregar
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1 rounded-full border-2 border-primary bg-surface-container-lowest">
              <button
                type="button"
                onClick={onDecrement}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 active:scale-95 transition-all"
                aria-label="Reducir cantidad"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-5 text-center text-label-lg font-bold text-primary">
                {quantity}
              </span>
              <button
                type="button"
                onClick={onIncrement}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/10 active:scale-95 transition-all"
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
