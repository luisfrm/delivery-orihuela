"use client"

import { useState, useTransition } from "react"
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react"
import { FormField } from "@/components/ui/form-field"
import { Button } from "@/components/ui/button"
import { createFirstAdmin } from "@/lib/actions/init"
import { capitalize } from "@/lib/utils"
import {
  validateEmail,
  validateRequired,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  general: string
}

const EMPTY_ERRORS: FormErrors = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  general: "",
}

function validateField(name: keyof FormData, value: string, allData?: FormData): string {
  switch (name) {
    case "firstName":
      return validateRequired(value, "El nombre")
    case "lastName":
      return validateRequired(value, "El apellido")
    case "email":
      return validateEmail(value)
    case "password":
      // El administrador requiere mínimo 8 caracteres para su contraseña
      return validatePassword(value, 8)
    case "confirmPassword":
      return validateConfirmPassword(value, allData?.password ?? "")
    default:
      return ""
  }
}

export function InitForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  const handleChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, { ...formData, [name]: value }),
        general: "",
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: FormErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData),
      general: "",
    }

    const hasErrors = Object.values(newErrors).some((e) => e !== "")
    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    const firstNameClean = capitalize(formData.firstName)
    const lastNameClean = capitalize(formData.lastName)

    startTransition(async () => {
      const result = await createFirstAdmin(
        formData.email,
        formData.password,
        firstNameClean,
        lastNameClean
      )

      if (result.error) {
        setErrors((prev) => ({ ...prev, general: result.error! }))
        return
      }

      setSuccess(true)
      // Brief delay to show success state before redirect
      setTimeout(() => {
        window.location.href = "/panel"
      }, 1200)
    })
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-title-lg text-on-surface font-semibold">¡Administrador creado!</p>
        <p className="text-body-md text-on-surface-variant">Redirigiendo al panel…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Nombre"
          name="firstName"
          placeholder="Luis"
          value={formData.firstName}
          onChange={handleChange("firstName")}
          error={errors.firstName}
          icon={<User className="size-4" />}
        />
        <FormField
          label="Apellido"
          name="lastName"
          placeholder="García"
          value={formData.lastName}
          onChange={handleChange("lastName")}
          error={errors.lastName}
          icon={<User className="size-4" />}
        />
      </div>

      <FormField
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="admin@ejemplo.com"
        value={formData.email}
        onChange={handleChange("email")}
        error={errors.email}
        icon={<Mail className="size-4" />}
      />

      <FormField
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Mínimo 8 caracteres"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        icon={<Lock className="size-4" />}
      />

      <FormField
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        placeholder="Repite la contraseña"
        value={formData.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={errors.confirmPassword}
        icon={<Lock className="size-4" />}
      />

      {errors.general && (
        <div className="flex items-start gap-2.5 rounded-lg bg-error-container/50 border border-error-container px-4 py-3">
          <AlertCircle className="size-4 text-error shrink-0 mt-0.5" />
          <p className="text-label-lg text-on-error-container">{errors.general}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Creando administrador…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Crear administrador
          </span>
        )}
      </Button>
    </form>
  )
}
