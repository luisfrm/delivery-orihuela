"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowRight, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  type StoreSelection,
} from "@/components/ui/store-selector"
import {
  type AddressSelection,
} from "@/components/ui/address-selector"
import { PickupStoreStep } from "./PickupStoreStep"
import { PickupAddressStep } from "./PickupAddressStep"
import { PickupPreviewForm } from "./PickupPreviewForm"
import { PickupPreviewSuccess } from "./PickupPreviewSuccess"
import { getDeliveryFee } from "@/lib/actions/settings"

type Step = "reference" | "store" | "address" | "preview" | "success"

interface PickupFormProps {
  onStepChange?: (step: Step) => void
}

const STEP_SUBTITLES: Record<Step, string> = {
  reference: "Paso 1 de 4 · Referencia",
  store: "Paso 2 de 4 · Establecimiento",
  address: "Paso 3 de 4 · Entrega",
  preview: "Paso 4 de 4 · Confirmar",
  success: "Pedido enviado",
}

export function PickupForm({ onStepChange }: PickupFormProps) {
  const [step, setStep] = useState<Step>("reference")
  const [pickupReference, setPickupReference] = useState("")
  const [storeSelection, setStoreSelection] = useState<StoreSelection>({
    type: "store",
    storeId: null,
    storeName: "",
    storeAddress: "",
  })
  const [addressSelection, setAddressSelection] = useState<AddressSelection>({
    type: "existing",
    addressId: null,
  })
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [deliveryFee, setDeliveryFee] = useState<number>(0)
  const [orderId, setOrderId] = useState<string | null>(null)

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

  // `getDeliveryFee()` already returns integer cents (e.g. 600 for 6€).
  // The DB stores cents consistently across orders/products/settings.
  const deliveryFeeCents = deliveryFee

  const handleStepChange = (next: Step) => {
    setStep(next)
  }

  let content: React.ReactNode

  if (step === "success" && orderId) {
    content = <PickupPreviewSuccess orderId={orderId} />
  } else if (step === "preview") {
    content = (
      <PickupPreviewForm
        pickupReference={pickupReference}
        storeSelection={storeSelection}
        addressSelection={addressSelection}
        additionalNotes={additionalNotes}
        deliveryFeeCents={deliveryFeeCents}
        onBack={() => handleStepChange("address")}
        onSuccess={(id) => {
          setOrderId(id)
          handleStepChange("success")
        }}
      />
    )
  } else if (step === "address") {
    content = (
      <PickupAddressStep
        addressSelection={addressSelection}
        onAddressChange={setAddressSelection}
        additionalNotes={additionalNotes}
        onNotesChange={setAdditionalNotes}
        onBack={() => handleStepChange("store")}
        onContinue={() => handleStepChange("preview")}
      />
    )
  } else if (step === "store") {
    content = (
      <PickupStoreStep
        value={storeSelection}
        onChange={setStoreSelection}
        onBack={() => handleStepChange("reference")}
        onContinue={() => handleStepChange("address")}
      />
    )
  } else {
    // reference step
    const isValid = pickupReference.trim().length > 0
    content = (
      <ReferenceStep
        value={pickupReference}
        onChange={setPickupReference}
        onContinue={() => handleStepChange("store")}
        isValid={isValid}
      />
    )
  }

  // Compute the subtitle for the modal header
  const subtitle = STEP_SUBTITLES[step] ?? STEP_SUBTITLES.reference

  // We don't render the subtitle here (it's shown by BuyModal via onStepChange);
  // we just track it for the side effect.
  void subtitle

  return (
    <div
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
      className="transition-[height] duration-300 ease-out overflow-hidden"
    >
      <div ref={containerRef}>{content}</div>
    </div>
  )
}

interface ReferenceStepProps {
  value: string
  onChange: (v: string) => void
  onContinue: () => void
  isValid: boolean
}

function ReferenceStep({
  value,
  onChange,
  onContinue,
  isValid,
}: ReferenceStepProps) {
  return (
    <div className="pt-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Referencia del pedido</h2>
        <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">
          Identifica tu pedido para que el rider pueda encontrarlo fácilmente
          en el establecimiento.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="pickup-reference"
          className="flex items-center gap-2 text-label-lg font-medium text-on-surface pl-1"
        >
          <FileText className="size-4 text-primary" />
          Referencia *
        </label>
        <textarea
          id="pickup-reference"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Pedido #1234, Encargo de Juan"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border-2 border-primary bg-surface-container-lowest text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/80 transition-all resize-none"
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onContinue}
        disabled={!isValid}
      >
        Continuar
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
