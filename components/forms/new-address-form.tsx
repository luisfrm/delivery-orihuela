"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { createAddress } from "@/lib/actions/addresses"

interface NewAddressFormProps {
  onSuccess: (addressName: string, addressLine: string) => void
  onCancel: () => void
}

export function NewAddressForm({ onSuccess, onCancel }: NewAddressFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    addressLine: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    addressLine: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) return "Este campo es requerido"
    return ""
  }

  const handleChange = (name: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = {
      name: validateField("name", formData.name),
      addressLine: validateField("addressLine", formData.addressLine),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((err) => err !== "")) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createAddress(
        formData.name,
        formData.addressLine,
        true
      )

      if (result?.error) {
        setIsSubmitting(false)
        return
      }

      onSuccess(formData.name, formData.addressLine)
    } catch {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1 text-sm text-primary font-bold hover:underline"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver
      </button>

      <div className="pt-2">
        <h3 className="text-lg font-bold text-on-surface mb-4">
          Nueva dirección de entrega
        </h3>

        <div className="space-y-4">
          <FormField
            label="Nombre de la dirección"
            name="addressName"
            placeholder="Ej: Casa, Trabajo, Casa de mis padres"
            value={formData.name}
            onChange={handleChange("name")}
            error={errors.name}
            icon={<MapPin className="size-4" />}
          />

          <FormField
            label="Dirección completa"
            name="addressLine"
            placeholder="Ej: Calle Mayor 123, 03300 Orihuela"
            value={formData.addressLine}
            onChange={handleChange("addressLine")}
            error={errors.addressLine}
          />
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar dirección"}
          </Button>
        </div>
      </div>
    </form>
  )
}