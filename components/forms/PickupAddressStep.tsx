"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, FileText, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AddressSelector,
  type AddressSelection,
} from "@/components/ui/address-selector"
import { NewAddressForm } from "@/components/forms/NewAddressForm"
import { getAddresses } from "@/lib/actions/addresses"

interface PickupAddressStepProps {
  addressSelection: AddressSelection
  onAddressChange: (selection: AddressSelection) => void
  additionalNotes: string
  onNotesChange: (notes: string) => void
  onBack: () => void
  onContinue: () => void
}

export function PickupAddressStep({
  addressSelection,
  onAddressChange,
  additionalNotes,
  onNotesChange,
  onBack,
  onContinue,
}: PickupAddressStepProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const isValid =
    addressSelection.type === "existing" && addressSelection.addressId !== null

  const handleNewAddressSuccess = async (name: string, addressLine: string) => {
    const fresh = await getAddresses()
    const created = fresh.find(
      (a) => a.name === name && a.address_line === addressLine
    )
    if (created) {
      onAddressChange({
        type: "existing",
        addressId: created.id,
        addressName: created.name,
        addressLine: created.address_line,
      })
      setRefreshKey((k) => k + 1)
    } else {
      onAddressChange({ type: "new", addressId: null })
    }
  }

  const handleCancelNew = () => {
    onAddressChange({ type: "existing", addressId: null })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-4 pb-3 space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Datos de entrega</h2>
        <p className="text-sm text-on-surface-variant leading-snug">
          Elige dónde recibir tu pedido y deja una nota para el rider si lo
          necesitas.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 pb-32">
        {/* Address section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-label-lg font-medium text-on-surface pl-1">
            <MapPin className="size-4 text-primary" />
            Dirección de entrega *
          </label>
          {addressSelection.type === "new" ? (
            <NewAddressForm
              onSuccess={handleNewAddressSuccess}
              onCancel={handleCancelNew}
            />
          ) : (
            <AddressSelector
              key={refreshKey}
              value={addressSelection}
              onChange={onAddressChange}
            />
          )}
        </div>

        {/* Notes section */}
        <div className="space-y-2">
          <label
            htmlFor="pickup-additional-notes"
            className="flex items-center gap-2 text-label-lg font-medium text-on-surface pl-1"
          >
            <FileText className="size-4 text-primary" />
            Notas adicionales
          </label>
          <Textarea
            id="pickup-additional-notes"
            value={additionalNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Indicaciones para el rider, referencias de la ubicación, datos extra..."
            rows={3}
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:px-6">
        <div className="mx-auto max-w-md flex gap-2">
          {addressSelection.type !== "new" && (
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
          )}
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onContinue}
            disabled={!isValid}
            className="flex-1"
          >
            Continuar
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
