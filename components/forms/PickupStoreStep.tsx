"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StoreSelector, type StoreSelection } from "@/components/ui/store-selector"

interface PickupStoreStepProps {
  value: StoreSelection
  onChange: (value: StoreSelection) => void
  onBack?: () => void
  onContinue: () => void
}

export function PickupStoreStep({
  value,
  onChange,
  onBack,
  onContinue,
}: PickupStoreStepProps) {
  const isValid = (() => {
    if (value.type === "store") return value.storeId !== null
    if (value.type === "custom") {
      return value.storeName.trim().length > 0 && value.storeAddress.trim().length > 0
    }
    return false
  })()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-4 pb-3 space-y-1">
        <h2 className="text-lg font-bold text-on-surface">
          Establecimiento
        </h2>
        <p className="text-sm text-on-surface-variant leading-snug">
          Busca el local o añade uno que no esté en la lista.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 pb-32">
        <StoreSelector value={value} onChange={onChange} />
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:px-6">
        <div className="mx-auto max-w-md flex gap-2">
          {onBack && (
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
