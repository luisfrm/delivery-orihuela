"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Store as StoreIcon,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  ShoppingCart,
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
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import { createOrder } from "@/lib/actions/orders"
import { toast } from "sonner"

type Step = "store" | "menu" | "address" | "payment" | "preview" | "success"

interface BuyFormProps {
  onStepChange?: (step: Step) => void
  onContinue?: (data: { store: Store; cart: Cart }) => void
}

const PAGE_SIZE = 6

export function BuyForm({ onStepChange, onContinue }: BuyFormProps) {
  const [step, setStep] = useState<Step>("store")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
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
  const [isPaymentValid, setIsPaymentValid] = useState(false)
  const [isPreviewValid, setIsPreviewValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadFee() {
      const fee = await getDeliveryFee()
      setDeliveryFee(fee)
    }
    loadFee()
  }, [])

  // Load stores once for footer validation (store step)
  useEffect(() => {
    let cancelled = false
    getStores().then((data) => {
      if (!cancelled) setStores(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // No height animation for FormArea — scroll handles overflow
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const handleStepChange = (next: Step) => {
    setStep(next)
  }

  // Derived validations
  const isStoreValid = selectedStoreId !== null
  const totalItems = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart])
  const itemsSubtotalCents = useMemo(
    () => products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.estimated_price, 0),
    [products, cart]
  )
  const isMenuValid = totalItems > 0
  const isAddressValid = addressSelection.type === "existing" && addressSelection.addressId !== null
  // isPaymentValid from child callback
  const isPreviewValidComputed = totalItems > 0 && isAddressValid && !!paymentMethodId && isPreviewValid

  const selectedStoreObj = stores.find((s) => s.id === selectedStoreId) ?? null

  const handleStoreContinue = () => {
    const store = stores.find((s) => s.id === selectedStoreId)
    if (!store) return
    setSelectedStore(store)
    handleStepChange("menu")
  }

  const handleMenuContinue = () => {
    if (!selectedStore) return
    onContinue?.({ store: selectedStore, cart })
    handleStepChange("address")
  }

  const handlePreviewConfirm = async () => {
    if (!selectedStore || !addressSelection.addressId || !paymentMethodId) return
    if (!isPreviewValid) return
    setIsSubmitting(true)
    try {
      const items = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, quantity]) => {
          const product = products.find((p) => p.id === productId)
          return {
            productId,
            quantity,
            unitPrice: product?.estimated_price ?? 0,
          }
        })

      const result = await createOrder({
        pickupReference: `Compra en ${selectedStore.name}`,
        storeId: selectedStore.id,
        customStoreName: selectedStore.name,
        customStoreAddress: selectedStore.address,
        addressId: addressSelection.addressId,
        additionalNotes: additionalNotes.trim() || null,
        deliveryFee,
        serviceType: "buy_and_deliver",
        items,
        paymentMethodId,
        paymentMethodName,
        paymentFieldInputs,
      })

      if (result?.error) {
        toast.error(result.error || "No se pudo crear el pedido")
        setIsSubmitting(false)
        return
      }

      if (result.orderId) {
        setOrderId(result.orderId)
        handleStepChange("success")
      }
    } catch {
      toast.error("No se pudo crear el pedido. Intenta de nuevo.")
      setIsSubmitting(false)
    }
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
        onValidationChange={setIsPreviewValid}
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
        onValidationChange={setIsPaymentValid}
      />
    )
  } else if (step === "menu" && selectedStore) {
    content = (
      <MenuForm
        store={selectedStore}
        cart={cart}
        onCartChange={setCart}
        onProductsLoaded={setProducts}
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
      <StoreStepControlled
        selectedStoreId={selectedStoreId}
        onSelectId={setSelectedStoreId}
        stores={stores}
      />
    )
  }

  // Footer per step — fixed outside scroll, always visible
  let footer: React.ReactNode = null
  if (step === "store") {
    footer = (
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStoreContinue}
          disabled={!isStoreValid}
        >
          Continuar
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  } else if (step === "menu" && selectedStore) {
    footer = (
      <div className="space-y-3">
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
            onClick={() => handleStepChange("store")}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleMenuContinue}
            disabled={!isMenuValid}
            className="flex-1"
          >
            Continuar
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    )
  } else if (step === "address") {
    const showBack = addressSelection.type !== "new"
    footer = (
      <div className="flex gap-2">
        {showBack && (
          <Button
            type="button"
            variant="outline_primary"
            size="lg"
            onClick={() => handleStepChange("menu")}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => handleStepChange("payment")}
          disabled={!isAddressValid}
          className="flex-1"
        >
          Continuar
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  } else if (step === "payment") {
    footer = (
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline_primary"
          size="lg"
          onClick={() => handleStepChange("address")}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => handleStepChange("preview")}
          disabled={!isPaymentValid}
          className="flex-1"
        >
          Continuar
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  } else if (step === "preview" && selectedStore) {
    const totalCents = itemsSubtotalCents + deliveryFee
    footer = (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-body-sm">
          <span className="text-on-surface-variant">Total</span>
          <span className="text-headline-md font-bold text-primary">
            {formatPriceCents(totalCents)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline_primary"
            size="lg"
            onClick={() => handleStepChange("payment")}
            disabled={isSubmitting}
            className="shrink-0"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handlePreviewConfirm}
            disabled={!isPreviewValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        </div>
      </div>
    )
  } else if (step === "success") {
    footer = null
  }

  // Success has no footer
  if (step === "success") {
    return (
      <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6">
        <div ref={containerRef}>{content}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* FormArea — scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 md:px-6">
        <div ref={containerRef}>{content}</div>
      </div>

      {/* Footer — fixed, always visible, respects rounded corners via parent overflow-hidden */}
      {footer && (
        <div className="flex-shrink-0 border-t border-outline-variant bg-white px-5 py-4 md:px-6">
          <div className="mx-auto max-w-md">{footer}</div>
        </div>
      )}
    </div>
  )
}

function StoreStepControlled({
  selectedStoreId,
  onSelectId,
  stores: propStores,
}: {
  selectedStoreId: string | null
  onSelectId: (id: string) => void
  stores: Store[]
}) {
  const [stores, setStores] = useState<Store[]>(propStores)
  const [isLoading, setIsLoading] = useState(propStores.length === 0)
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const debouncedSearch = useDebounce(search, 300)

  const [prevSearch, setPrevSearch] = useState(debouncedSearch)
  if (prevSearch !== debouncedSearch) {
    setPrevSearch(debouncedSearch)
    setVisibleCount(PAGE_SIZE)
  }

  // Sync propStores when parent loads
  useEffect(() => {
    if (propStores.length > 0) {
      setStores(propStores)
      setIsLoading(false)
    }
  }, [propStores])

  useEffect(() => {
    if (propStores.length > 0) return
    let cancelled = false
    getStores().then((data) => {
      if (!cancelled) {
        setStores(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [propStores.length])

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
            onSelect={(store) => onSelectId(store.id)}
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
    </div>
  )
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
