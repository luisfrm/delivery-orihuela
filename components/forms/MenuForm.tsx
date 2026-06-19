"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStoreMenuBySlug } from "@/lib/actions/stores"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import {
  getCategoryById,
  type MenuCategory,
} from "@/lib/restaurants/menu-categories"
import type { Product, Store } from "@/lib/types"
import { MenuCategoryTabs } from "./MenuCategoryTabs"
import { MenuProductCard } from "./MenuProductCard"

export type Cart = Record<string, number>

interface MenuFormProps {
  store: Store
  cart: Cart
  onCartChange: (cart: Cart) => void
  onContinue: () => void
  onBack: () => void
}

export function MenuForm({
  store,
  cart,
  onCartChange,
  onContinue,
  onBack,
}: MenuFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categoryOrder, setCategoryOrder] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await getStoreMenuBySlug(store.slug)
      if (cancelled) return
      if (!data) {
        setIsLoading(false)
        return
      }
      setProducts(data.products.filter((p) => p.is_active))
      setCategoryOrder(data.categoryOrder)
      setIsLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [store.slug])

  const activeProducts = products.filter((p) => p.is_active)

  const productsByCategory = activeProducts.reduce(
    (acc, product) => {
      const category = product.menu_category
      if (!category) return acc
      if (!acc[category]) acc[category] = []
      acc[category].push(product)
      return acc
    },
    {} as Record<string, Product[]>
  )

  const availableCategories: MenuCategory[] = categoryOrder
    .map((id) => getCategoryById(id))
    .filter((cat): cat is MenuCategory => Boolean(cat && productsByCategory[cat.id]?.length))

  const visibleProducts =
    selectedCategory === null
      ? activeProducts
      : productsByCategory[selectedCategory] ?? []

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  const itemsSubtotalCents = activeProducts.reduce((sum, p) => {
    const qty = cart[p.id] ?? 0
    return sum + qty * p.estimated_price
  }, 0)

  const isCartValid = totalItems > 0

  const handleIncrement = (productId: string) => {
    onCartChange({ ...cart, [productId]: (cart[productId] ?? 0) + 1 })
  }

  const handleDecrement = (productId: string) => {
    const current = cart[productId] ?? 0
    if (current <= 1) {
      const next = { ...cart }
      delete next[productId]
      onCartChange(next)
    } else {
      onCartChange({ ...cart, [productId]: current - 1 })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-4 pb-3 space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Selecciona tu pedido</h2>
        <p className="text-sm text-on-surface-variant leading-snug">
          Elige los productos que deseas comprar en {store.name}.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 pb-32">
        {isLoading ? (
          <MenuSkeleton count={4} />
        ) : activeProducts.length === 0 ? (
          <div className="py-12 text-center text-body-md text-on-surface-variant">
            Este establecimiento aún no tiene productos disponibles.
          </div>
        ) : (
          <>
            <MenuCategoryTabs
              categories={availableCategories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <div className="space-y-2">
              {visibleProducts.map((product) => (
                <MenuProductCard
                  key={product.id}
                  product={product}
                  quantity={cart[product.id] ?? 0}
                  onIncrement={() => handleIncrement(product.id)}
                  onDecrement={() => handleDecrement(product.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:px-6">
        <div className="mx-auto max-w-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-body-md">
              <ShoppingCart className="size-4 text-primary" />
              <span className="font-semibold text-on-surface">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>
            <span className="text-headline-md font-bold text-primary">
              {formatPriceCents(itemsSubtotalCents)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline_primary"
              size="lg"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="size-4" />
              Volver
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onContinue}
              disabled={!isCartValid}
              className="flex-1"
            >
              Continuar
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 items-start rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
        >
          <div className="size-16 shrink-0 rounded-lg bg-outline-variant/40 animate-pulse" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-3/4 rounded bg-outline-variant/40 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-outline-variant/40 animate-pulse" />
            <div className="h-8 w-20 rounded bg-outline-variant/40 animate-pulse ml-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}
