"use client"

import { useState } from "react"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OtpInput } from "@/components/ui/otp-input"
import { toast } from "sonner"

interface OtpStepProps {
  email: string
  onVerified: () => void
  onBack: () => void
}

export function OtpStep({ email, onVerified, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("El código debe tener 6 dígitos")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      const { verifyOtp } = await import("@/lib/actions/auth")
      const result = await verifyOtp(email, otp)

      if (result?.error) {
        setError(result.error)
        setIsVerifying(false)
        return
      }

      toast.success("¡Email verificado exitosamente!")
      onVerified()
    } catch {
      setError("Ocurrió un error al verificar. Intenta de nuevo.")
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)

    try {
      const { resendOtp } = await import("@/lib/actions/auth")
      const result = await resendOtp(email)

      if (result?.error) {
        toast.error("No se pudo reenviar el código")
      } else {
        toast.success("Código reenviado. Revisa tu correo.")
      }
    } catch {
      toast.error("No se pudo reenviar el código")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <div className="size-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="size-8 text-primary" />
        </div>
        <h3 className="text-title-lg text-on-surface">Verifica tu correo</h3>
        <p className="text-body-md text-on-surface-variant">
          Hemos enviado un código de 6 dígitos a
          <br />
          <span className="font-bold text-on-surface">{email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-label-lg text-on-surface pl-1 font-medium block text-center">
          Código de verificación
        </label>
        <div className="flex justify-center">
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value)
              if (error) setError("")
            }}
            disabled={isVerifying}
          />
        </div>
        {error && (
          <p className="text-label-md text-destructive text-center">{error}</p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="w-full"
          onClick={handleVerify}
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying ? "Verificando..." : "Verificar código"}
        </Button>

        <Button
          type="button"
          variant="link"
          size="lg"
          className="w-full"
          onClick={onBack}
          disabled={isVerifying}
        >
          <ArrowLeft className="size-4" />
          Volver
        </Button>
      </div>

      <div className="text-center">
        <p className="text-body-md text-on-surface-variant">
          ¿No recibiste el código?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary font-bold hover:underline disabled:opacity-50"
          >
            {isResending ? "Reenviando..." : "Reenviar"}
          </button>
        </p>
      </div>
    </div>
  )
}