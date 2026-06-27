"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  Type,
  Eye,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { getActivePaymentMethodsAction } from "@/lib/actions/payment-methods"
import {
  MAX_FIELD_LABEL,
  type PaymentFieldInput,
  type PaymentMethod,
} from "@/lib/types/payment-methods"

interface PaymentMethodSelectProps {
  /** id del método seleccionado, o null si ninguno */
  paymentMethodId: string | null
  /**
   * Valores de los campos. Para text: string tipeado. Para
   * image: URL pública (ya subida por el cliente) o string
   * vacío mientras se sube.
   */
  paymentFieldInputs: PaymentFieldInput[]
  /** Callback cuando cambia el método o cualquier valor de campo */
  onChange: (
    methodId: string | null,
    methodName: string | null,
    fieldInputs: PaymentFieldInput[]
  ) => void
  /** Navegación al siguiente paso (preview) */
  onContinue: () => void
  /** Navegación al paso anterior (address) */
  onBack: () => void
}

const PAYMENT_METHODS_BUCKET = "organization-assets"

function getExtensionFromMimeType(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      return "bin"
  }
}

export function PaymentMethodSelect({
  paymentMethodId,
  paymentFieldInputs,
  onChange,
  onContinue,
  onBack,
}: PaymentMethodSelectProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // uploadToken único por sesión de pago. Se genera al montar
  // el componente y se usa como parte del path de cada imagen
  // subida a Supabase Storage. Independiente de la order.
  const [uploadToken] = useState(() => crypto.randomUUID())
  // Set de fieldIds que están subiendo actualmente. Para mostrar
  // un estado de "subiendo..." en el ImageUpload.
  const [uploadingFields, setUploadingFields] = useState<Set<string>>(
    () => new Set()
  )

  const supabase = createClient()

  async function loadMethods() {
    setIsLoading(true)
    const data = await getActivePaymentMethodsAction()
    setMethods(data)
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMethods()
  }, [])

  const selectedMethod = useMemo(
    () => methods.find((m) => m.id === paymentMethodId) ?? null,
    [methods, paymentMethodId]
  )

  const handleSelectMethod = (method: PaymentMethod) => {
    if (method.id === paymentMethodId) return
    const initialInputs: PaymentFieldInput[] = method.fields.map((f) => ({
      fieldId: f.id,
      type: f.type,
      label: f.label,
      // visual: el value ya viene del method definition (admin-set)
      // text: vacío, el cliente lo llena
      // image: vacío, el cliente lo sube
      value: f.type === "visual" ? (f.value ?? "") : "",
    }))
    onChange(method.id, method.name, initialInputs)
  }

  const updateFieldValue = (fieldId: string, newValue: string) => {
    const next = paymentFieldInputs.map((f) =>
      f.fieldId === fieldId ? { ...f, value: newValue } : f
    )
    onChange(paymentMethodId, null, next)
  }

  const getFieldValue = (fieldId: string): string => {
    return paymentFieldInputs.find((f) => f.fieldId === fieldId)?.value ?? ""
  }

  /**
   * Sube una imagen de payment method directamente a Supabase
   * Storage usando la sesión del usuario (RLS permite INSERT
   * a authenticated). El path es independiente de la order:
   * `payments/{methodId}/{uploadToken}-{fieldId}.{ext}`
   */
  async function uploadPaymentImage(
    methodId: string,
    fieldId: string,
    file: File
  ): Promise<string | null> {
    const extension = getExtensionFromMimeType(file.type)
    const path = `payments/${methodId}/${uploadToken}-${fieldId}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from(PAYMENT_METHODS_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      toast.error(`Error al subir la imagen: ${uploadError.message}`)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PAYMENT_METHODS_BUCKET).getPublicUrl(path)

    return publicUrl
  }

  const handleImageChange = async (
    methodId: string,
    fieldId: string,
    file: File | null
  ) => {
    if (!file) {
      // Usuario quitó la imagen
      updateFieldValue(fieldId, "")
      return
    }

    // Marcar como subiendo
    setUploadingFields((prev) => new Set(prev).add(fieldId))

    const url = await uploadPaymentImage(methodId, fieldId, file)

    setUploadingFields((prev) => {
      const next = new Set(prev)
      next.delete(fieldId)
      return next
    })

    if (url) {
      updateFieldValue(fieldId, url)
    }
  }

  /**
   * Valida que el método esté seleccionado y todos los campos
   * que el cliente debe llenar estén completos. Para text:
   * string no-vacío. Para image: URL no-vacía (ya subida) y no
   * en proceso de subida. Los campos visual ya tienen value
   * pre-rellenado, no requieren acción del cliente.
   */
  const isValid = useMemo(() => {
    if (!selectedMethod) return false
    if (paymentFieldInputs.length !== selectedMethod.fields.length) return false
    for (const input of paymentFieldInputs) {
      if (input.type === "text") {
        if (input.value.trim() === "") return false
      } else if (input.type === "image") {
        if (input.value.trim() === "") return false
        // No permitir continuar mientras se está subiendo
        if (uploadingFields.has(input.fieldId)) return false
      }
      // visual: el value ya viene pre-rellenado, no requiere validación
    }
    return true
  }, [selectedMethod, paymentFieldInputs, uploadingFields])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pt-4 pb-3 space-y-1">
        <h2 className="text-lg font-bold text-on-surface">Método de pago</h2>
        <p className="text-sm text-on-surface-variant leading-snug">
          Selecciona un método de pago y completa los datos solicitados.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 pb-32">
        {isLoading ? (
          <ul className="space-y-2" aria-busy="true" aria-live="polite">
            {Array.from({ length: 2 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest"
              >
                <div className="size-10 rounded-lg bg-outline-variant/40 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-outline-variant/40 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-outline-variant/40 animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        ) : methods.length === 0 ? (
          <div className="py-12 text-center text-body-md text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
            No hay métodos de pago disponibles
          </div>
        ) : (
          <>
            {/* Lista de métodos seleccionables */}
            <ul className="space-y-2">
              {methods.map((method) => {
                const isSelected = method.id === paymentMethodId
                return (
                  <li key={method.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectMethod(method)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-outline-variant bg-surface-container-lowest hover:border-primary/60"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 size-10 rounded-lg flex items-center justify-center",
                          isSelected
                            ? "bg-primary text-on-primary"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <CreditCard className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-md font-semibold text-on-surface truncate">
                          {method.name}
                        </p>
                        <p className="text-label-md text-on-surface-variant truncate">
                          {method.fields.length === 0
                            ? "Sin campos requeridos"
                            : `${method.fields.length} ${
                                method.fields.length === 1 ? "campo" : "campos"
                              }: ${method.fields
                                .map((f) => f.label)
                                .filter(Boolean)
                                .join(", ")}`}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 size-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
                          <Check className="size-3.5" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Campos dinámicos del método seleccionado */}
            {selectedMethod && selectedMethod.fields.length > 0 && (
              <div className="space-y-4 pt-2">
                <p className="text-label-lg font-medium text-on-surface">
                  Completa los datos del pago
                </p>
                {selectedMethod.fields.map((field) => {
                  if (field.type === "text") {
                    const currentValue = getFieldValue(field.id)
                    return (
                      <div key={field.id} className="space-y-1.5">
                        <label
                          htmlFor={`pm-field-${field.id}`}
                          className="flex items-center gap-2 text-label-lg font-medium text-on-surface pl-1"
                        >
                          <Type className="size-4 text-primary" />
                          {field.label}
                        </label>
                        <Input
                          id={`pm-field-${field.id}`}
                          name={`pm-field-${field.id}`}
                          value={currentValue}
                          onChange={(e) =>
                            updateFieldValue(field.id, e.target.value)
                          }
                          placeholder={`Ingresa ${field.label.toLowerCase()}`}
                          maxLength={MAX_FIELD_LABEL}
                          required
                        />
                      </div>
                    )
                  }

                  if (field.type === "visual") {
                    const currentValue = getFieldValue(field.id)
                    return (
                      <div key={field.id} className="space-y-1.5">
                        <label className="flex items-center gap-2 text-label-lg font-medium text-on-surface pl-1">
                          <Eye className="size-4 text-primary" />
                          {field.label}
                        </label>
                        <div className="px-3 py-2.5 rounded-md bg-surface-container-low border border-outline-variant/50">
                          <p className="text-base font-semibold text-on-surface break-words">
                            {currentValue}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  // image
                  const currentValue = getFieldValue(field.id)
                  const isUploading = uploadingFields.has(field.id)
                  return (
                    <ImageUpload
                      key={field.id}
                      label={field.label}
                      name={`pm-field-${field.id}`}
                      // Para ImageUpload: si currentValue es una URL,
                      // la pasamos como existingUrl para mostrar el preview.
                      // value siempre es null (el cliente no maneja Files
                      // — la URL se guarda después de subir).
                      value={null}
                      existingUrl={currentValue || null}
                      onChange={(file) =>
                        handleImageChange(selectedMethod.id, field.id, file)
                      }
                      disabled={isUploading}
                      aspectRatio="video"
                      helperText={
                        isUploading
                          ? "Subiendo imagen..."
                          : "Sube una foto o captura del comprobante de pago"
                      }
                    />
                  )
                })}
              </div>
            )}

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:px-6">
              <div className="mx-auto max-w-md flex gap-2">
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
          </>
        )}
      </div>
    </div>
  )
}
