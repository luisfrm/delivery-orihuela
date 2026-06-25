"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Search, Store as StoreIcon } from "lucide-react"

import {
  ListItemSelector,
  ListItem,
  ListItemContent,
} from "@/components/ui/list-item-selector"
import { Input } from "@/components/ui/input"
import { getStores } from "@/lib/actions/stores"
import { getCategoryNames, parseCategoryIds } from "@/lib/restaurants/categories"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { Store } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface StoreSelection {
  type: "store" | "custom"
  storeId: string | null
  storeName: string
  storeAddress: string
}

interface StoreSelectorProps {
  value: StoreSelection
  onChange: (value: StoreSelection) => void
  className?: string
}

const CUSTOM_OPTION_ID = "__custom__"
const PAGE_SIZE = 6

interface CustomStoreOption {
  id: string
  type: "custom"
}

function isCustomStore(
  item: Store | CustomStoreOption
): item is CustomStoreOption {
  return "type" in item && (item as { type: string }).type === "custom"
}

export function StoreSelector({
  value,
  onChange,
  className,
}: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    let cancelled = false
    async function fetchStores() {
      const data = await getStores()
      if (!cancelled) {
        setStores(data)
        setIsLoading(false)
      }
    }
    fetchStores()
    return () => {
      cancelled = true
    }
  }, [])

  // Reset pagination when search changes
  const [prevSearch, setPrevSearch] = useState(debouncedSearch)
  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch)
    setVisibleCount(PAGE_SIZE)
  }

  const handleSelect = (
    item: Store | CustomStoreOption
  ) => {
    if (isCustomStore(item)) {
      onChange({
        type: "custom",
        storeId: null,
        storeName: "",
        storeAddress: "",
      })
    } else {
      const store = item as Store
      onChange({
        type: "store",
        storeId: store.id,
        storeName: store.name,
        storeAddress: store.address,
      })
    }
  }

  const handleCustomNameChange = (name: string) => {
    onChange({
      type: "custom",
      storeId: null,
      storeName: name,
      storeAddress: value.storeAddress,
    })
  }

  const handleCustomAddressChange = (address: string) => {
    onChange({
      type: "custom",
      storeId: null,
      storeName: value.storeName,
      storeAddress: address,
    })
  }

  const isSearching = search.trim() !== "" && search !== debouncedSearch

  const filteredStores = stores.filter((store) => {
    if (!debouncedSearch.trim()) return true
    const q = debouncedSearch.toLowerCase()
    return (
      store.name.toLowerCase().includes(q) ||
      store.address.toLowerCase().includes(q)
    )
  })

  const visibleStores = filteredStores.slice(0, visibleCount)
  const hasMore = visibleCount < filteredStores.length

  const handleLoadMore = useCallback(() => {
    setVisibleCount((v) => v + PAGE_SIZE)
  }, [])

  const sentinelRef = useInfiniteScroll({
    hasMore,
    onLoadMore: handleLoadMore,
  })

  const selectedId =
    value.type === "store" ? value.storeId : value.storeName ? CUSTOM_OPTION_ID : null

  return (
    <div className={cn("space-y-4", className)}>
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
        <ul className="space-y-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: 2 }).map((_, i) => (
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
      ) : filteredStores.length === 0 ? (
        <div className="py-6 text-center text-body-md text-muted-foreground">
          {debouncedSearch.trim()
            ? "No se encontraron tiendas"
            : "No hay tiendas disponibles"}
        </div>
      ) : (
        <>
          <ListItemSelector
            items={visibleStores}
            selectedId={selectedId}
            onSelect={handleSelect}
            getItemId={(store) => store.id}
            searchText={(store) => `${store.name} ${store.address}`}
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
                      categoryNames.length > 0
                        ? categoryNames.join(", ")
                        : store.address || "Sin dirección"
                    }
                  />
                </ListItem>
              )
            }}
            footerAction={
              <button
                type="button"
                onClick={() =>
                  handleSelect({
                    id: CUSTOM_OPTION_ID,
                    type: "custom",
                  } as CustomStoreOption)
                }
                className="w-full"
              >
                <ListItem isSelected={selectedId === CUSTOM_OPTION_ID}>
                  <ListItemContent
                    icon={<span className="text-lg">🏪</span>}
                    title="Otro"
                    subtitle="Establecimiento no listado"
                  />
                </ListItem>
              </button>
            }
          />

          {hasMore ? (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center gap-2 py-4 text-body-sm text-on-surface-variant"
            >
              <Loader2 className="size-4 animate-spin" />
              <span>Cargando más...</span>
            </div>
          ) : null}
        </>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-label-lg text-on-surface pl-1 font-medium block mb-1.5">
            Nombre del establecimiento *
          </label>
          <input
            type="text"
            value={value.storeName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            placeholder="Ej: Panadería López"
            disabled={value.type === "store"}
            className={cn(
              "w-full h-12 px-4 rounded-lg border-2 text-base transition-all",
              value.type === "store"
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "border-primary/30 bg-surface-container-lowest text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            )}
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface pl-1 font-medium block mb-1.5">
            Dirección del establecimiento *
          </label>
          <input
            type="text"
            value={value.storeAddress}
            onChange={(e) => handleCustomAddressChange(e.target.value)}
            placeholder="Ej: Calle Mayor 123, Orihuela"
            disabled={value.type === "store"}
            className={cn(
              "w-full h-12 px-4 rounded-lg border-2 text-base transition-all",
              value.type === "store"
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "border-primary/30 bg-surface-container-lowest text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            )}
          />
        </div>
      </div>
    </div>
  )
}
