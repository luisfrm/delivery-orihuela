"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStoreProductsPage } from "@/lib/actions/stores"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import { getCategoryById, type MenuCategory } from "@/lib/restaurants/menu-categories"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { Product, Store } from "@/lib/types"
import { MenuCategoryTabs } from "./MenuCategoryTabs"
import { MenuProductCard } from "./MenuProductCard"

export type Cart = Record<string, number>

interface MenuFormProps {
  store: Store
  cart: Cart
  onCartChange: (cart: Cart) => void
  onProductsLoaded: (products: Product[]) => void
  onContinue: () => void
  onBack: () => void
}

const PAGE_SIZE = 20

export function MenuForm({
  store,
  cart,
  onCartChange,
  onProductsLoaded,
  onContinue,
  onBack,
}: MenuFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [cachedProducts, setCachedProducts] = useState<Record<string, Product>>({})
  const [categoryOrder, setCategoryOrder] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Merge newly fetched products into cache for cart/subtotal (persists across category switches)
  const mergeCacheAndNotify = useCallback(
    (newProducts: Product[], prevCache: Record<string, Product>) => {
      const nextCache = { ...prevCache }
      for (const p of newProducts) nextCache[p.id] = p
      onProductsLoaded(Object.values(nextCache))
      return nextCache
    },
    [onProductsLoaded]
  )

  // Fetch helper: offset is absolute position in paginated result for current category filter
  const fetchPage = useCallback(
    async (offset: number, category: string | null, isInitial: boolean) => {
      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)
      try {
        const data = await getStoreProductsPage(store.slug, {
          categoryId: category,
          offset,
          limit: PAGE_SIZE,
        })
        if (!data) {
          if (isInitial) setProducts([])
          setHasMore(false)
          if (isInitial) setCategoryOrder([])
          return
        }

        // Server already filters is_active=true and applies range() pagination
        if (isInitial) {
          setProducts(data.products)
          setCategoryOrder(data.categoryOrder)
          setCachedProducts((prev) => mergeCacheAndNotify(data.products, prev))
        } else {
          setProducts((prev) => [...prev, ...data.products])
          setCachedProducts((prev) => mergeCacheAndNotify(data.products, prev))
          // categoryOrder stable per store, keep first value
          if (data.categoryOrder.length > 0) {
            setCategoryOrder((prev) => (prev.length === 0 ? data.categoryOrder : prev))
          }
        }
        setHasMore(data.hasMore)
      } catch (e) {
        console.error("Error loading paginated products:", e)
        setError("No se pudieron cargar los productos. Intenta de nuevo.")
        if (isInitial) setHasMore(false)
      } finally {
        if (isInitial) setIsLoading(false)
        else setIsLoadingMore(false)
      }
    },
    [store.slug, mergeCacheAndNotify]
  )

  // Reset cache only when store changes (not on category change) to preserve cart products
  useEffect(() => {
    setCachedProducts({})
    setCategoryOrder([])
  }, [store.slug])

  // Initial load + reload on slug or category change (reset visible pagination only)
  useEffect(() => {
    let cancelled = false
    async function loadInitial() {
      // Reset visible state synchronously before fetch; keep cache
      setProducts([])
      setHasMore(true)
      setError(null)
      if (cancelled) return
      await fetchPage(0, selectedCategory, true)
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [store.slug, selectedCategory, fetchPage])

  const handleSelectCategory = useCallback((cat: string | null) => {
    // Reset handled by effect watching selectedCategory
    setSelectedCategory(cat)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return
    const nextOffset = products.length
    void fetchPage(nextOffset, selectedCategory, false)
  }, [isLoading, isLoadingMore, hasMore, products.length, selectedCategory, fetchPage])

  const sentinelRef = useInfiniteScroll({
    hasMore: hasMore && !isLoading && !isLoadingMore,
    onLoadMore: handleLoadMore,
    rootMargin: "200px",
  })

  // Categories: show all from categoryOrder (stable) rather than progressive filter by loaded products.
  // This keeps tabs stable across pagination and allows filtering to empty categories without flicker.
  // If categoryOrder is empty (still loading), fallback to no tabs.
  const availableCategories: MenuCategory[] = categoryOrder
    .map((id) => getCategoryById(id))
    .filter((cat): cat is MenuCategory => Boolean(cat))

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  // Use cache for subtotal so cart items from previously visited categories are still counted
  const itemsSubtotalCents = Object.values(cachedProducts).reduce((sum, p) => {
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
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-body-md text-destructive">{error}</p>
            <Button
              variant="outline_primary"
              size="sm"
              onClick={() => fetchPage(0, selectedCategory, true)}
            >
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-body-md text-on-surface-variant">
            {selectedCategory
              ? "No hay productos en esta categoría."
              : "Este establecimiento aún no tiene productos disponibles."}
          </div>
        ) : (
          <>
            <MenuCategoryTabs
              categories={availableCategories}
              selectedCategory={selectedCategory}
              onSelect={handleSelectCategory}
            />

            <div className="space-y-2">
              {products.map((product) => (
                <MenuProductCard
                  key={product.id}
                  product={product}
                  quantity={cart[product.id] ?? 0}
                  onIncrement={() => handleIncrement(product.id)}
                  onDecrement={() => handleDecrement(product.id)}
                />
              ))}
            </div>

            {/* Sentinel + loading more */}
            {hasMore ? (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center gap-2 py-4 text-body-sm text-on-surface-variant"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cargando más...</span>
                  </>
                ) : (
                  <span className="h-4" aria-hidden />
                )}
              </div>
            ) : null}

            {isLoadingMore ? (
              <div className="space-y-2">
                <MenuSkeleton count={2} />
              </div>
            ) : null}
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
