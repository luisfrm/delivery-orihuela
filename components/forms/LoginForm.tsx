"use client"

import { useState } from "react"
import { Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { OtpStep } from "@/components/forms/OtpStep"
import { toast } from "sonner"

interface LoginFormProps {
  onSuccess?: () => void
  onRegisterClick?: () => void
}

type Step = "login" | "otp"

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [step, setStep] = useState<Step>("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const [generalError, setGeneralError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Este campo es requerido"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Ingresa un correo válido"
        return ""
      case "password":
        if (!value) return "Este campo es requerido"
        return ""
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
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((err) => err !== "")) {
      return
    }

    setIsSubmitting(true)

    try {
      const { signInWithEmail } = await import("@/lib/actions/auth")
      const result = await signInWithEmail(formData.email, formData.password)

      if (result?.error) {
        if (result.code === 'email_not_confirmed') {
          setLoginEmail(formData.email)
          
          const { resendOtp } = await import("@/lib/actions/auth")
          await resendOtp(formData.email)
          
          toast.info("Tu email aún no está verificado. Te enviamos un nuevo código.")
          
          setStep("otp")
          setIsSubmitting(false)
          return
        }
        
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success("¡Bienvenido de vuelta!")
      onSuccess?.()
      window.location.reload()
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.")
      setIsSubmitting(false)
}
  }

  if (step === "otp") {
    return (
      <OtpStep
        email={loginEmail}
        onVerified={() => {
          onSuccess?.()
          window.location.reload()
        }}
        onBack={() => setStep("login")}
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

      <FormField
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Tu contraseña"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        icon={<Lock className="size-4" />}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-2 border-primary accent-primary"
          />
          <span className="text-body-md text-on-surface">Recordarme</span>
        </label>
        <button
          type="button"
          className="text-body-md text-primary font-bold hover:underline"
          onClick={() => {/* TODO: forgot password */}}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>

      {/* TODO: OAuth - O inicia sesión con
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center text-label-md">
          <span className="bg-surface px-4 text-on-surface-variant">
            O inicia sesión con
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
          onClick={() => {}}
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
        ¿No tienes una cuenta?{" "}
        <button
          type="button"
          onClick={onRegisterClick}
          className="text-primary font-bold hover:underline"
        >
          Regístrate
        </button>
      </p>
    </form>
  )
}