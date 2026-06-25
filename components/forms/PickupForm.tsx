"use client"

import { useState, useEffect } from "react"
import { MapPin, Store, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StoreSelector, StoreSelection } from "@/components/ui/store-selector"
import { AddressSelector, AddressSelection } from "@/components/ui/address-selector"
import { NewAddressForm } from "@/components/forms/NewAddressForm"
import { createOrder } from "@/lib/actions/orders"
import { getDeliveryFee } from "@/lib/actions/settings"
import { toast } from "sonner"

type Step = "form" | "preview" | "success"

export function PickupForm() {
  const [step, setStep] = useState<Step>("form")
  const [deliveryFee, setDeliveryFee] = useState(4)

  const [pickupReference, setPickupReference] = useState("")
  const [storeSelection, setStoreSelection] = useState<StoreSelection>({
    type: "custom",
    storeId: null,
    storeName: "",
    storeAddress: "",
  })
  const [addressSelection, setAddressSelection] = useState<AddressSelection>({
    type: "existing",
    addressId: null,
  })
  const [additionalNotes, setAdditionalNotes] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchDeliveryFee() {
      const fee = await getDeliveryFee()
      setDeliveryFee(fee)
    }
    fetchDeliveryFee()
  }, [])

  const isFormValid = () => {
    const hasReference = pickupReference.trim().length > 0
    const hasStore =
      storeSelection.type === "store" || storeSelection.storeName.trim().length > 0
    const hasAddress =
      addressSelection.type === "existing" && addressSelection.addressId !== null
    return hasReference && hasStore && hasAddress
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return

    setIsSubmitting(true)

    try {
      const result = await createOrder({
        pickupReference,
        storeId: storeSelection.type === "store" ? storeSelection.storeId : null,
        customStoreName: storeSelection.storeName || null,
        customStoreAddress: storeSelection.storeAddress || null,
        addressId: addressSelection.addressId!,
        additionalNotes: additionalNotes.trim() || null,
        deliveryFee,
      })

      if (result?.error) {
        toast.error(result.error || "No se pudo crear el pedido")
        setIsSubmitting(false)
        return
      }

      setStep("success")
    } catch {
      toast.error("No se pudo crear el pedido. Intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle className="size-8 text-primary" />
        </div>
        <h3 className="text-headline-md font-bold text-on-surface mb-2">
          Pedido en espera
        </h3>
        <p className="text-body-md text-muted-foreground mb-6 max-w-xs">
          Tu solicitud ha sido enviada. Un rider aceptará tu pedido pronto.
        </p>
        <p className="text-body-sm text-muted-foreground mb-6">
          Puedes revisar el estado de tus pedidos desde la sección de pedidos.
        </p>
        <a
          href="/pedidos"
          className="text-primary font-bold hover:underline mb-4"
        >
          Ver mis pedidos
        </a>
        <div className="pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  if (step === "preview") {
    return (
      <div className="space-y-6 py-4">
        <div>
          <h3 className="text-headline-md font-bold text-on-surface mb-1">
            Confirmar pedido
          </h3>
          <p className="text-body-md text-muted-foreground">
            Revisa los datos antes de confirmar.
          </p>
        </div>

        <div className="space-y-4 bg-surface-container-lowest rounded-xl p-4">
          <PreviewItem
            icon={<FileText className="size-5" />}
            label="Referencia"
            value={pickupReference}
          />

          <PreviewItem
            icon={<Store className="size-5" />}
            label="Establecimiento"
            value={
              storeSelection.type === "store"
                ? storeSelection.storeName
                : `${storeSelection.storeName} (Personalizado)`
            }
            subValue={
              storeSelection.type === "custom"
                ? storeSelection.storeAddress
                : storeSelection.storeAddress || undefined
            }
          />

          <PreviewItem
            icon={<MapPin className="size-5" />}
            label="Entrega en"
            value={addressSelection.addressName || "Dirección"}
            subValue={addressSelection.addressLine}
          />

          {additionalNotes.trim() && (
            <PreviewItem
              icon={<FileText className="size-5" />}
              label="Notas"
              value={additionalNotes}
            />
          )}

          <div className="border-t border-outline-variant pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-body-md font-medium text-on-surface">
                Costo de entrega
              </span>
              <span className="text-headline-md font-bold text-primary">
                €{deliveryFee.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>
          <Button
            variant="outline_primary"
            size="xl"
            className="w-full"
            onClick={() => setStep("form")}
          >
            ← Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      {addressSelection.type === "new" ? (
        <NewAddressForm
          onSuccess={(name, addressLine) => {
            setAddressSelection({
              type: "existing",
              addressId: `new-${Date.now()}`,
              addressName: name,
              addressLine: addressLine,
            })
          }}
          onCancel={() =>
            setAddressSelection({ type: "existing", addressId: null })
          }
        />
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-label-lg text-on-surface pl-1 font-medium block">
              Referencia del pedido *
            </label>
            <input
              type="text"
              value={pickupReference}
              onChange={(e) => setPickupReference(e.target.value)}
              placeholder="Ej: Pedido #1234, Encargo de Juan"
              className="w-full h-14 px-4 rounded-lg border-2 border-primary bg-surface-container-lowest text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/80 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-title-lg font-bold text-primary block">
              Establecimiento *
            </label>
            <StoreSelector
              value={storeSelection}
              onChange={setStoreSelection}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-lg text-on-surface pl-1 font-medium block">
              Dirección de entrega *
            </label>
            <AddressSelector
              value={addressSelection}
              onChange={setAddressSelection}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-label-lg text-on-surface pl-1 font-medium block">
              Notas adicionales
            </label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Indicaciones para el rider, datos extra del pedido..."
              rows={3}
            />
          </div>

          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={() => setStep("preview")}
            disabled={!isFormValid()}
          >
            Continuar
          </Button>
        </>
      )}
    </div>
  )
}

function PreviewItem({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 text-muted-foreground mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-label-md text-muted-foreground">{label}</p>
        <p className="text-body-md font-medium text-on-surface">{value}</p>
        {subValue && (
          <p className="text-body-sm text-muted-foreground truncate">
            {subValue}
          </p>
        )}
      </div>
    </div>
  )
}