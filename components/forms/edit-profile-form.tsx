"use client"

import { useState } from "react"
import { User, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"

interface EditProfileFormProps {
  initialFirstName: string
  initialLastName: string
  email: string
  onSuccess: (firstName: string, lastName: string) => void
  onCancel: () => void
}

export function EditProfileForm({
  initialFirstName,
  initialLastName,
  email,
  onSuccess,
  onCancel,
}: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
  })

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  })

  const [generalError, setGeneralError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim() ? "" : "Este campo es requerido"
      default:
        return ""
    }
  }

  const handleChange = (name: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((err) => err !== "")) {
      return
    }

    setIsSubmitting(true)

    try {
      const { updateProfile } = await import("@/lib/actions/profile")
      const result = await updateProfile(formData.firstName, formData.lastName)

      if (result?.error) {
        setGeneralError(result.error)
        setIsSubmitting(false)
        return
      }

      onSuccess(formData.firstName, formData.lastName)
    } catch {
      setGeneralError("Ocurrió un error. Intenta de nuevo.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {generalError && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {generalError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nombre"
          name="firstName"
          placeholder="Ej. Juan"
          value={formData.firstName}
          onChange={handleChange("firstName")}
          error={errors.firstName}
          icon={<User className="size-4" />}
        />
        <FormField
          label="Apellido"
          name="lastName"
          placeholder="Ej. Pérez"
          value={formData.lastName}
          onChange={handleChange("lastName")}
          error={errors.lastName}
        />
      </div>

      <FormField
        label="Correo Electrónico"
        name="email"
        type="email"
        value={email}
        onChange={() => {}}
        icon={<Mail className="size-4" />}
      >
        <input
          type="hidden"
          name="email"
          value={email}
          readOnly
          className="sr-only"
        />
      </FormField>

      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <ArrowLeft className="size-4" />
          Cancelar
        </Button>
      </div>
    </form>
  )
}
