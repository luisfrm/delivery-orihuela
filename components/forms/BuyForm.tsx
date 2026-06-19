"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import {
  Store as StoreIcon,
  MapPin,
  ArrowRight,
  Search,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ListItemSelector,
  ListItem,
  ListItemContent,
} from "@/components/ui/list-item-selector"
import { getStores } from "@/lib/actions/stores"
import { getCategoryNames, parseCategoryIds } from "@/lib/restaurants/categories"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { Store } from "@/lib/types"

interface BuyFormProps {
  onContinue?: (store: Store) => void
}

const PAGE_SIZE = 6

export function BuyForm({ onContinue }: BuyFormProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const debouncedSearch = useDebounce(search, 300)

  // Reset visible count when the debounced search changes
  const [prevSearch, setPrevSearch] = useState(debouncedSearch)
  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch)
    setVisibleCount(PAGE_SIZE)
  }

  // Load stores on mount (must be unconditional — Rules of Hooks)
  useLoadStores(setStores, setIsLoading)

  const filteredStores = stores.filter((store) => {
    if (!debouncedSearch.trim()) return true
    const searchLower = debouncedSearch.toLowerCase()
    return (
      store.name.toLowerCase().includes(searchLower) ||
      store.address.toLowerCase().includes(searchLower)
    )
  })

  const visibleStores = filteredStores.slice(0, visibleCount)
  const hasMore = visibleCount < filteredStores.length

  const isSearching = search.trim() !== "" && search !== debouncedSearch

  const handleLoadMore = useCallback(() => {
    setVisibleCount((v) => v + PAGE_SIZE)
  }, [])

  const sentinelRef = useInfiniteScroll({
    hasMore,
    onLoadMore: handleLoadMore,
  })

  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null
  const isValid = selectedStoreId !== null

  const handleContinue = () => {
    if (!isValid || !selectedStore) return
    onContinue?.(selectedStore)
  }

  return (
    <div className="pt-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-on-surface">
          Seleccionar Establecimiento
        </h2>
        <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">
          ¿Dónde realizarás la compra? Busca el local o elige uno cercano.
        </p>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Search className="size-4" />
        </span>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar restaurante, farmacia, tienda..."
          className="pl-11 pr-4"
        />
      </div>

      {isLoading || isSearching ? (
        <StoreListSkeleton count={2} />
      ) : filteredStores.length === 0 ? (
        <div className="py-12 text-center text-body-md text-on-surface-variant">
          {debouncedSearch.trim()
            ? "No se encontraron tiendas"
            : "No hay tiendas disponibles"}
        </div>
      ) : (
        <>
          <ListItemSelector
            items={visibleStores}
            selectedId={selectedStoreId}
            onSelect={(store) => setSelectedStoreId(store.id)}
            getItemId={(store) => store.id}
            showSearch={false}
            emptyMessage=""
            renderItem={(store, isSelected) => {
              const categoryNames = getCategoryNames(
                parseCategoryIds(store.category_ids)
              )
              return (
                <ListItem isSelected={isSelected}>
                  <ListItemContent
                    icon={
                      store.logo_url ? (
                        <Image
                          src={store.logo_url}
                          alt={store.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <StoreIcon className="size-5" />
                      )
                    }
                    title={store.name}
                    subtitle={
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {store.address}
                        </span>
                        {categoryNames.length > 0 && (
                          <span className="text-xs text-on-surface-variant">
                            {categoryNames.join(", ")}
                          </span>
                        )}
                      </div>
                    }
                  />
                </ListItem>
              )
            }}
          />

          {hasMore ? (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center gap-2 py-4 text-body-sm text-on-surface-variant"
            >
              <Loader2 className="size-4 animate-spin" />
              <span>Cargando más...</span>
            </div>
          ) : (
            <div className="py-4 text-center text-label-md text-on-surface-variant">
              No hay más tiendas
            </div>
          )}
        </>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleContinue}
        disabled={!isValid}
      >
        Continuar
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

function useLoadStores(
  setStores: (stores: Store[]) => void,
  setIsLoading: (loading: boolean) => void
) {
  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await getStores()
      if (!cancelled) {
        setStores(data)
        setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [setStores, setIsLoading])
}

function StoreListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
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
  )
}
