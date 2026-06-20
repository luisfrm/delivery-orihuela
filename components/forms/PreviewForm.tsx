"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle, MapPin, Store as StoreIcon, ShoppingBag, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createOrder } from "@/lib/actions/orders"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import { toast } from "sonner"
import type { Product, Store } from "@/lib/types"
import type { AddressSelection } from "@/components/ui/address-selector"
import type { Cart } from "./MenuForm"

interface PreviewFormProps {
  store: Store
  products: Product[]
  cart: Cart
  addressSelection: AddressSelection
  additionalNotes: string
  deliveryFee: number
  onBack: () => void
  onSuccess: (orderId: string) => void
}

export function PreviewForm({
  store,
  products,
  cart,
  addressSelection,
  additionalNotes,
  deliveryFee,
  onBack,
  onSuccess,
}: PreviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const itemsSubtotalCents = products.reduce((sum, p) => {
    const qty = cart[p.id] ?? 0
    return sum + qty * p.estimated_price
  }, 0)

  const deliveryFeeCents = Math.round(deliveryFee * 100)
  const totalCents = itemsSubtotalCents + deliveryFeeCents

  const cartItems = products.filter((p) => (cart[p.id] ?? 0) > 0)
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  const isValid = totalItems > 0 && addressSelection.addressId !== null

  const handleConfirm = async () => {
    if (!isValid || !addressSelection.addressId) return

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
        pickupReference: `Compra en ${store.name}`,
        storeId: store.id,
        customStoreName: store.name,
        customStoreAddress: store.address,
        addressId: addressSelection.addressId,
        additionalNotes: additionalNotes.trim() || null,
        deliveryFee: deliveryFeeCents,
        serviceType: "buy_and_deliver",
        items,
      })

      if (result?.error) {
        toast.error(result.error || "No se pudo crear el pedido")
        setIsSubmitting(false)
        return
      }

      if (result.orderId) {
        onSuccess(result.orderId)
      }
    } catch {
      toast.error("No se pudo crear el pedido. Intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-4 pb-3 space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Confirmar pedido</h2>
        <p className="text-sm text-on-surface-variant leading-snug">
          Revisa los datos antes de confirmar tu compra.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 pb-32">
        {/* Store section */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <StoreIcon className="size-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface-variant">Tienda</p>
              <p className="text-body-md font-semibold text-on-surface truncate">
                {store.name}
              </p>
              <p className="text-body-sm text-on-surface-variant truncate">
                {store.address}
              </p>
            </div>
          </div>
        </div>

        {/* Products section */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="size-4 text-primary" />
            <p className="text-label-md text-on-surface-variant">
              Productos ({totalItems} {totalItems === 1 ? "item" : "items"})
            </p>
          </div>
          <div className="space-y-1.5">
            {cartItems.map((product) => {
              const qty = cart[product.id] ?? 0
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-2 text-body-sm"
                >
                  <span className="text-on-surface truncate flex-1">
                    {product.name}{" "}
                    <span className="text-on-surface-variant">×{qty}</span>
                  </span>
                  <span className="text-on-surface font-medium shrink-0">
                    {formatPriceCents(qty * product.estimated_price)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Delivery section */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="size-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface-variant">
                Entregar en
              </p>
              <p className="text-body-md font-semibold text-on-surface truncate">
                {addressSelection.addressName}
              </p>
              <p className="text-body-sm text-on-surface-variant truncate">
                {addressSelection.addressLine}
              </p>
            </div>
          </div>
          {additionalNotes.trim() && (
            <div className="mt-3 pt-3 border-t border-outline-variant flex items-start gap-2">
              <FileText className="size-4 text-on-surface-variant shrink-0 mt-0.5" />
              <p className="text-body-sm text-on-surface-variant italic">
                {additionalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 space-y-1.5">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface">
              {formatPriceCents(itemsSubtotalCents)}
            </span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Costo de entrega</span>
            <span className="text-on-surface">
              {formatPriceCents(deliveryFeeCents)}
            </span>
          </div>
          <div className="border-t border-outline-variant pt-2 mt-2 flex justify-between">
            <span className="text-body-md font-semibold text-on-surface">
              Total
            </span>
            <span className="text-headline-md font-bold text-primary">
              {formatPriceCents(totalCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:px-6">
        <div className="mx-auto max-w-md flex gap-2">
          <Button
            type="button"
            variant="outline_primary"
            size="lg"
            onClick={onBack}
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
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PreviewSuccess({ orderId }: { orderId: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <CheckCircle className="size-8 text-primary" />
      </div>
      <h3 className="text-headline-md font-bold text-on-surface mb-2">
        Pedido en espera
      </h3>
      <p className="text-body-md text-on-surface-variant mb-2 max-w-xs">
        Tu compra ha sido enviada. Un rider aceptará tu pedido pronto.
      </p>
      <p className="text-label-md text-on-surface-variant mb-6">
        ID: <span className="font-mono">{orderId.slice(0, 8)}</span>
      </p>
      <a
        href="/pedidos"
        className="text-primary font-bold hover:underline mb-4"
      >
        Ver mis pedidos
      </a>
      <div className="pt-2">
        <Button
          variant="outline_primary"
          size="lg"
          onClick={() => window.location.reload()}
        >
          Cerrar
        </Button>
      </div>
    </div>
  )
}
