"use client"

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { User, Mail, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { PhoneInput } from "@/components/ui/phone-input"
import { OtpStep } from "@/components/forms/OtpStep"
import { toast } from "sonner"
import { cn, capitalize } from "@/lib/utils"
import {
  validateEmail,
  validateRequired,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  checkPasswordStrength,
} from "@/lib/validation"

function PasswordRequirements({ password }: { password: string }) {
  const strength = checkPasswordStrength(password, 6)
  const requirements = [
    { label: "Mínimo 6 caracteres", met: strength.minLength },
    { label: "1 mayúscula", met: strength.hasUppercase },
    { label: "1 símbolo o número", met: strength.hasNumberOrSymbol },
  ]

  return (
    <div className="space-y-1 mt-1.5">
      {requirements.map((req, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Check
            className={cn(
              "size-4 transition-colors",
              req.met ? "text-green-500" : "text-gray-400"
            )}
          />
          <span
            className={cn(
              "text-label-md transition-colors",
              req.met ? "text-green-500" : "text-muted-foreground"
            )}
          >
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="primary"
      size="xl"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </Button>
  )
}

interface RegistrationFormProps {
  onSuccess?: () => void
  onLoginClick?: () => void
}

type Step = "register" | "success" | "otp"

function SuccessStep({ email, onContinue }: { email: string; onContinue: () => void }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown === 0) {
      onContinue()
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, onContinue])

  return (
    <div className="space-y-6 py-4 text-center">
      <div className="size-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
        <Check className="size-8 text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-title-lg text-on-surface">
          ¡Cuenta creada exitosamente!
        </h3>
        <p className="text-body-md text-on-surface-variant">
          Hemos enviado un código de verificación a:
          <br />
          <span className="font-bold text-on-surface">{email}</span>
        </p>
        <p className="text-body-sm text-on-surface-variant">
          Revisa tu bandeja de entrada (y carpeta de spam) para completar tu registro.
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="w-full"
          onClick={onContinue}
        >
          Continuar a verificación ({countdown}s)
        </Button>
      </div>
    </div>
  )
}

export function RegistrationForm({
  onSuccess,
  onLoginClick,
}: RegistrationFormProps) {
  const [step, setStep] = useState<Step>("register")
  const [registeredEmail, setRegisteredEmail] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [generalError, setGeneralError] = useState("")

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        return validateRequired(value, "El nombre")
      case "lastName":
        return validateRequired(value, "El apellido")
      case "phone":
        return validatePhone(value)
      case "email":
        return validateEmail(value)
      case "password":
        return validatePassword(value, 6, true)
      case "confirmPassword":
        return validateConfirmPassword(value, formData.password)
      default:
        return ""
    }
  }

  const handleChange = (name: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((err) => err !== "")) {
      return
    }

    const firstName = capitalize(formData.firstName)
    const lastName = capitalize(formData.lastName)

    try {
      const { signUpWithEmail } = await import("@/lib/actions/auth")
      const result = await signUpWithEmail(
        formData.email,
        formData.password,
        firstName,
        lastName,
        formData.phone
      )

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("¡Cuenta creada! Revisa tu correo para verificar tu cuenta.")
      setRegisteredEmail(formData.email)
      setStep("success")
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.")
    }
  }

  if (step === "success") {
    return (
      <SuccessStep
        email={registeredEmail}
        onContinue={() => setStep("otp")}
      />
    )
  }

  if (step === "otp") {
    return (
      <OtpStep
        email={registeredEmail}
        onVerified={() => {
          onSuccess?.()
          window.location.reload()
        }}
        onBack={() => setStep("register")}
      />
    )
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Correo Electrónico"
          name="email"
          type="email"
          placeholder="juan.perez@ejemplo.com"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          icon={<Mail className="size-4" />}
        />
        <PhoneInput
          value={formData.phone}
          onChange={handleChange("phone")}
          error={errors.phone}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            icon={<Lock className="size-4" />}
          />
          <PasswordRequirements password={formData.password} />
        </div>
        <FormField
          label="Confirmar Contraseña"
          name="confirmPassword"
          type="password"
          placeholder="Repite la contraseña"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          error={errors.confirmPassword}
          icon={<Lock className="size-4" />}
        />
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>

      {/* TODO: OAuth - O regístrate con
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center text-label-md">
          <span className="bg-surface px-4 text-on-surface-variant">
            O regístrate con
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          disabled
          title="Próximamente"
          onClick={() => { }}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Apple
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="xl"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </div>
      */}

      <p className="text-center text-body-md text-on-surface-variant">
        ¿Ya tienes una cuenta?{" "}
        <button
          type="button"
          onClick={onLoginClick}
          className="text-primary font-bold hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  )
}