"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  MapPin,
  Store as StoreIcon,
  ShoppingBag,
  FileText,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createOrder } from "@/lib/actions/orders"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import { toast } from "sonner"
import type { Product, Store } from "@/lib/types"
import type { AddressSelection } from "@/components/ui/address-selector"
import type { PaymentFieldInput } from "@/lib/types/payment-methods"
import type { Cart } from "./MenuForm"

interface PreviewFormProps {
  store: Store
  products: Product[]
  cart: Cart
  addressSelection: AddressSelection
  additionalNotes: string
  deliveryFee: number
  paymentMethodId: string | null
  paymentMethodName: string | null
  paymentFieldInputs: PaymentFieldInput[]
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
  paymentMethodId,
  paymentMethodName,
  paymentFieldInputs,
  onBack,
  onSuccess,
}: PreviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zoomImage, setZoomImage] = useState<{
    url: string
    label: string
  } | null>(null)

  const itemsSubtotalCents = products.reduce((sum, p) => {
    const qty = cart[p.id] ?? 0
    return sum + qty * p.estimated_price
  }, 0)

  // `getDeliveryFee()` already returns integer cents (e.g. 600 for 6€).
  // The DB stores cents consistently across orders/products/settings.
  const deliveryFeeCents = deliveryFee
  const totalCents = itemsSubtotalCents + deliveryFeeCents

  const cartItems = products.filter((p) => (cart[p.id] ?? 0) > 0)
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0)

  const isValid =
    totalItems > 0 &&
    addressSelection.addressId !== null &&
    paymentMethodId !== null &&
    paymentFieldInputs.every((input) => input.type === "visual" || input.value.trim().length > 0)

  const handleConfirm = async () => {
    if (!isValid || !addressSelection.addressId || !paymentMethodId) return

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

        {/* Payment method section */}
        {paymentMethodId && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <p className="text-label-md text-on-surface-variant">
                Método de pago
              </p>
            </div>
            <PaymentFieldValuesDisplay
              inputs={paymentFieldInputs}
              onZoom={(url, label) => setZoomImage({ url, label })}
              hideVisualFields={true}
              paymentMethodName={paymentMethodName}
            />
          </div>
        )}

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
      <div className="fixed bottom-0 left-0 right-0 z-40 rounded-b-2xl overflow-hidden border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:px-6">
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

      {zoomImage && (
        <ImageZoomPopup
          imageUrl={zoomImage.url}
          label={zoomImage.label}
          onClose={() => setZoomImage(null)}
        />
      )}
    </div>
  )
}

interface PaymentFieldValuesDisplayProps {
  inputs: PaymentFieldInput[]
  onZoom: (url: string, label: string) => void
  hideVisualFields?: boolean
  paymentMethodName?: string | null
}

/**
 * Renderiza la lista de valores del método de pago. Para
 * campos text, muestra el valor. Para campos image, muestra
 * un thumbnail con un botón lupa que abre el popup de zoom.
 * `input.value` para image es una URL (ya subida por el cliente
 * en el paso de payment).
 */
function PaymentFieldValuesDisplay({
  inputs,
  onZoom,
  hideVisualFields,
  paymentMethodName,
}: PaymentFieldValuesDisplayProps) {
  return (
    <ul className="space-y-1.5">
      {paymentMethodName && (
        <li className="flex items-start justify-between gap-2 text-body-sm">
          <span className="text-on-surface-variant shrink-0">
            Nombre:
          </span>
          <span className="text-on-surface font-semibold text-right">
            {paymentMethodName}
          </span>
        </li>
      )}
      {inputs.map((input) => {
        // Hide visual fields if hideVisualFields is true
        if (input.type === "visual" && hideVisualFields) {
          return null
        }

        return (
          <li
            key={input.fieldId}
            className="flex items-start justify-between gap-2 text-body-sm"
          >
            <span className="text-on-surface-variant shrink-0">
              {input.label}:
            </span>
            {input.type === "text" ? (
              <span className="text-on-surface font-medium text-right break-all">
                {input.value}
              </span>
            ) : input.type === "visual" ? (
              <span className="text-on-surface font-semibold text-base text-right break-words whitespace-pre-line">
                {input.value}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onZoom(input.value, input.label)}
                aria-label={`Ver imagen: ${input.label}`}
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-outline-variant bg-surface-container hover:opacity-80 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={input.value}
                  alt={input.label}
                  className="h-full w-full object-cover"
                />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Popup simple (no `ResponsiveModal`) que muestra la imagen
 * a tamaño controlado. Se usa dentro del `BuyModal` existente,
 * por lo que NO abre otro `ResponsiveModal` (eso causaría
 * doble modal anidado).
 *
 * Cierre: click en el overlay oscuro, en la X, o en la imagen.
 * Tamaño: max-w-3xl max-h-[85vh] con `object-contain` para
 * que la imagen no se corte y no ocupe toda la pantalla.
 */
function ImageZoomPopup({
  imageUrl,
  label,
  onClose,
}: {
  imageUrl: string
  label: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[60] rounded-2xl bg-black/50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Cerrar"
        className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center backdrop-blur-sm z-10"
      >
        <X className="size-5" />
      </button>
      <div
        className="relative max-w-3xl max-h-[85vh] w-fit h-fit rounded-2xl overflow-hidden bg-surface-container-lowest shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={label}
          width={1200}
          height={1200}
          className="max-w-3xl max-h-[85vh] w-auto h-auto object-contain"
          unoptimized
        />
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
