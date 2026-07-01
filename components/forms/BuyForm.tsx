"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
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
import { getDeliveryFee } from "@/lib/actions/settings"
import { getCategoryNames, parseCategoryIds } from "@/lib/restaurants/categories"
import { useDebounce } from "@/hooks/useDebounce"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { Product, Store } from "@/lib/types"
import type { PaymentFieldInput } from "@/lib/types/payment-methods"
import { MenuForm, type Cart } from "./MenuForm"
import { DeliveryForm } from "./DeliveryForm"
import { PaymentMethodSelect } from "./PaymentMethodSelect"
import { PreviewForm, PreviewSuccess } from "./PreviewForm"
import type { AddressSelection } from "@/components/ui/address-selector"

type Step = "store" | "menu" | "address" | "payment" | "preview" | "success"

interface BuyFormProps {
  onStepChange?: (step: Step) => void
  onContinue?: (data: { store: Store; cart: Cart }) => void
}

const PAGE_SIZE = 6

export function BuyForm({ onStepChange, onContinue }: BuyFormProps) {
  const [step, setStep] = useState<Step>("store")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [cart, setCart] = useState<Cart>({})
  const [addressSelection, setAddressSelection] = useState<AddressSelection>({
    type: "existing",
    addressId: null,
  })
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [deliveryFee, setDeliveryFee] = useState<number>(0)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)
  const [paymentMethodName, setPaymentMethodName] = useState<string | null>(null)
  const [paymentFieldInputs, setPaymentFieldInputs] = useState<PaymentFieldInput[]>([])

  useEffect(() => {
    async function loadFee() {
      const fee = await getDeliveryFee()
      setDeliveryFee(fee)
    }
    loadFee()
  }, [])

  // Height transition: measure content and animate changes
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const newHeight = entries[0]?.contentRect.height ?? 0
      setHeight(newHeight)
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const handleStepChange = (next: Step) => {
    setStep(next)
  }

  let content: React.ReactNode
  if (step === "success" && orderId) {
    content = <PreviewSuccess orderId={orderId} />
  } else if (step === "preview" && selectedStore) {
    content = (
      <PreviewForm
        store={selectedStore}
        products={products}
        cart={cart}
        addressSelection={addressSelection}
        additionalNotes={additionalNotes}
        deliveryFee={deliveryFee}
        paymentMethodId={paymentMethodId}
        paymentMethodName={paymentMethodName}
        paymentFieldInputs={paymentFieldInputs}
        onBack={() => handleStepChange("payment")}
        onSuccess={(id) => {
          setOrderId(id)
          handleStepChange("success")
        }}
      />
    )
  } else if (step === "payment") {
    content = (
      <PaymentMethodSelect
        paymentMethodId={paymentMethodId}
        paymentFieldInputs={paymentFieldInputs}
        onChange={(methodId, methodName, inputs) => {
          setPaymentMethodId(methodId)
          setPaymentMethodName(methodName)
          setPaymentFieldInputs(inputs)
        }}
        onContinue={() => handleStepChange("preview")}
        onBack={() => handleStepChange("address")}
      />
    )
  } else if (step === "menu" && selectedStore) {
    content = (
      <MenuForm
        store={selectedStore}
        cart={cart}
        onCartChange={setCart}
        onProductsLoaded={setProducts}
        onContinue={() => {
          onContinue?.({ store: selectedStore, cart })
          handleStepChange("address")
        }}
        onBack={() => handleStepChange("store")}
      />
    )
  } else if (step === "address") {
    content = (
      <DeliveryForm
        addressSelection={addressSelection}
        onAddressChange={setAddressSelection}
        additionalNotes={additionalNotes}
        onNotesChange={setAdditionalNotes}
        onContinue={() => handleStepChange("payment")}
        onBack={() => handleStepChange("menu")}
      />
    )
  } else {
    content = (
      <StoreStep
        onSelect={(store) => {
          setSelectedStore(store)
          handleStepChange("menu")
        }}
      />
    )
  }

  return (
    <div
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
      className="transition-[height] duration-300 ease-out overflow-hidden"
    >
      <div ref={containerRef}>{content}</div>
    </div>
  )
}

function StoreStep({ onSelect }: { onSelect: (store: Store) => void }) {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const debouncedSearch = useDebounce(search, 300)

  const [prevSearch, setPrevSearch] = useState(debouncedSearch)
  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch)
    setVisibleCount(PAGE_SIZE)
  }

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
    onSelect(selectedStore)
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
          ) : null}
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
