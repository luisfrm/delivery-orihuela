"use client"

import { useState } from "react"
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Store as StoreIcon,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createOrder } from "@/lib/actions/orders"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import type { StoreSelection } from "@/components/ui/store-selector"
import type { AddressSelection } from "@/components/ui/address-selector"
import type { PaymentFieldInput } from "@/lib/types/payment-methods"

interface PickupPreviewFormProps {
  pickupReference: string
  storeSelection: StoreSelection
  addressSelection: AddressSelection
  additionalNotes: string
  deliveryFeeCents: number
  paymentMethodId: string | null
  paymentMethodName: string | null
  paymentFieldInputs: PaymentFieldInput[]
  onBack: () => void
  onSuccess: (orderId: string) => void
}

export function PickupPreviewForm({
  pickupReference,
  storeSelection,
  addressSelection,
  additionalNotes,
  deliveryFeeCents,
  paymentMethodId,
  paymentMethodName,
  paymentFieldInputs,
  onBack,
  onSuccess,
}: PickupPreviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid =
    pickupReference.trim().length > 0 &&
    (storeSelection.type === "store"
      ? storeSelection.storeId !== null
      : storeSelection.storeName.trim().length > 0 &&
        storeSelection.storeAddress.trim().length > 0) &&
    addressSelection.type === "existing" &&
    addressSelection.addressId !== null &&
    paymentMethodId !== null &&
    paymentFieldInputs.every((input) => input.type === "visual" || input.value.trim().length > 0)

  const handleConfirm = async () => {
    if (!isValid || !addressSelection.addressId || !paymentMethodId) return
    setIsSubmitting(true)
    try {
      const isCustom = storeSelection.type === "custom"
      const result = await createOrder({
        pickupReference: pickupReference.trim(),
        storeId: isCustom ? null : storeSelection.storeId,
        customStoreName: isCustom ? storeSelection.storeName : null,
        customStoreAddress: isCustom ? storeSelection.storeAddress : null,
        addressId: addressSelection.addressId,
        additionalNotes: additionalNotes.trim() || null,
        deliveryFee: deliveryFeeCents,
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

  const isCustom = storeSelection.type === "custom"
  const storeName = isCustom
    ? `${storeSelection.storeName} (Personalizado)`
    : storeSelection.storeName

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-4 pb-3 space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Confirmar pedido</h2>
        <p className="text-sm text-on-surface-variant leading-snug">
          Revisa los datos antes de enviar tu solicitud de recogida.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 pb-32">
        {/* Reference */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="size-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface-variant">Referencia</p>
              <p className="text-body-md font-semibold text-on-surface truncate">
                {pickupReference}
              </p>
            </div>
          </div>
        </div>

        {/* Store */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <StoreIcon className="size-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface-variant">
                Establecimiento
              </p>
              <p className="text-body-md font-semibold text-on-surface truncate">
                {storeName}
              </p>
              {storeSelection.storeAddress && (
                <p className="text-body-sm text-on-surface-variant truncate">
                  {storeSelection.storeAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="size-4 text-primary" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface-variant">Entregar en</p>
              <p className="text-body-md font-semibold text-on-surface truncate">
                {addressSelection.addressName || "Dirección"}
              </p>
              {addressSelection.addressLine && (
                <p className="text-body-sm text-on-surface-variant truncate">
                  {addressSelection.addressLine}
                </p>
              )}
            </div>
          </div>
        </div>

        {additionalNotes.trim() && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
            <div className="flex items-start gap-2">
              <FileText className="size-4 text-on-surface-variant shrink-0 mt-0.5" />
              <p className="text-body-sm text-on-surface-variant italic">
                {additionalNotes}
              </p>
            </div>
          </div>
        )}

        {/* Payment method */}
        {paymentMethodId && (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              <p className="text-label-md text-on-surface-variant">
                Método de pago
              </p>
            </div>
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
              {paymentFieldInputs.map((input) => (
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
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-outline-variant bg-surface-container">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={input.value}
                        alt={input.label}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Totals */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 space-y-1.5">
          <div className="flex justify-between text-body-sm">
            <span className="text-on-surface-variant">Costo de entrega</span>
            <span className="text-on-surface font-medium">
              {formatPriceCents(deliveryFeeCents)}
            </span>
          </div>
          <div className="border-t border-outline-variant pt-2 mt-2 flex justify-between">
            <span className="text-body-md font-semibold text-on-surface">
              Total
            </span>
            <span className="text-headline-md font-bold text-primary">
              {formatPriceCents(deliveryFeeCents)}
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
            {isSubmitting ? "Enviando..." : "Confirmar pedido"}
          </Button>
        </div>
      </div>
    </div>
  )
}
