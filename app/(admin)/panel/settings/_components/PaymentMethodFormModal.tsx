"use client"

import { useState, useTransition } from "react"
import { CreditCard, Save } from "lucide-react"
import { toast } from "sonner"

import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { PaymentMethodFieldsEditor } from "./PaymentMethodFieldsEditor"
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
} from "@/lib/actions/payment-methods"
import {
  MAX_PAYMENT_METHOD_NAME,
  type PaymentMethod,
  type PaymentMethodFieldDefinition,
} from "@/lib/types/payment-methods"

interface PaymentMethodFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  method: PaymentMethod | null
  onSuccess: () => void
}

export function PaymentMethodFormModal({
  open,
  onOpenChange,
  method,
  onSuccess,
}: PaymentMethodFormModalProps) {
  const isEditing = method !== null
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent
        icon={<CreditCard className="size-[18px]" />}
        title={isEditing ? "Editar método de pago" : "Nuevo método de pago"}
        subtitle={
          isEditing
            ? "Modifica la estructura del método"
            : "Define el método y los campos que el cliente llenará al pagar"
        }
        desktopMaxWidth="max-w-xl"
      >
        <PaymentMethodFormBody
          key={`${open ? "open" : "closed"}-${method?.id ?? "new"}`}
          method={method}
          onSuccess={onSuccess}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

interface PaymentMethodFormBodyProps {
  method: PaymentMethod | null
  onSuccess: () => void
}

function PaymentMethodFormBody({
  method,
  onSuccess,
}: PaymentMethodFormBodyProps) {
  const isEditing = method !== null

  const [name, setName] = useState(method?.name ?? "")
  const [isActive, setIsActive] = useState(method?.isActive ?? true)
  const [fields, setFields] = useState<PaymentMethodFieldDefinition[]>(
    method?.fields ?? []
  )
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [generalError, setGeneralError] = useState("")
  const [isPending, startTransition] = useTransition()

  const isValid =
    name.trim().length > 0 &&
    name.trim().length <= MAX_PAYMENT_METHOD_NAME &&
    fields.every(
      (f) =>
        f.label.trim().length > 0 &&
        (f.type !== "visual" || (f.value ?? "").trim().length > 0)
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrors({ name: "El nombre es requerido" })
      return
    }
    if (trimmedName.length > MAX_PAYMENT_METHOD_NAME) {
      setErrors({ name: `Máximo ${MAX_PAYMENT_METHOD_NAME} caracteres` })
      return
    }

    const cleanedFields: PaymentMethodFieldDefinition[] = fields.map((f) => ({
      id: f.id,
      type: f.type,
      label: f.label.trim(),
      value: f.type === "visual" ? (f.value ?? "").trim() : undefined,
    }))

    const toastId = toast.loading(
      isEditing ? "Guardando cambios…" : "Creando método de pago…"
    )

    startTransition(async () => {
      const result = isEditing
        ? await updatePaymentMethodAction(method!.id, {
            name: trimmedName,
            fields: cleanedFields,
            isActive,
          })
        : await createPaymentMethodAction({
            name: trimmedName,
            fields: cleanedFields,
            isActive,
          })

      if (result?.error) {
        toast.error(result.error, { id: toastId })
        setGeneralError(result.error)
        return
      }

      toast.success(
        isEditing ? "Método actualizado" : "Método creado",
        { id: toastId }
      )
      onSuccess()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2" noValidate>
      <FormField
        label="Nombre del método"
        name="name"
        placeholder="Ej. Pago Móvil"
        value={name}
        onChange={(v) => {
          setName(v)
          if (errors.name) setErrors({})
        }}
        error={errors.name}
        maxLength={MAX_PAYMENT_METHOD_NAME}
      />

      <PaymentMethodFieldsEditor fields={fields} onChange={setFields} />

      <div className="flex items-center gap-2">
        <input
          id="payment-method-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="size-4 rounded border-2 border-primary accent-primary"
        />
        <label
          htmlFor="payment-method-active"
          className="text-body-md text-on-surface cursor-pointer"
        >
          Método activo (visible para los clientes)
        </label>
      </div>

      {generalError && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-body-sm p-3">
          {generalError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onSuccess}
          disabled={isPending}
          className="sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || !isValid}
          className="sm:w-auto"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="size-4" />
              {isEditing ? "Guardar cambios" : "Crear método"}
            </span>
          )}
        </Button>
      </div>

      <Input type="hidden" name="_method_id" value={method?.id ?? ""} />
    </form>
  )
}
