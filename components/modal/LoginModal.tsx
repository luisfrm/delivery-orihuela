"use client"

import { LogIn } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { LoginForm } from "@/components/forms/LoginForm"
import { Button } from "@/components/ui/button"

interface LoginModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onRegisterClick?: () => void
}

export function LoginModal({
  trigger,
  open,
  onOpenChange,
  onRegisterClick,
}: LoginModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalTrigger asChild>
        {trigger || (
          <Button variant="primary" size="xl">
            <LogIn className="w-5 h-5" />
            Iniciar sesión
          </Button>
        )}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={<LogIn className="size-[18px]" />}
        title="Inicia sesión"
        subtitle="Bienvenido de vuelta a Los Latinos."
        desktopMaxWidth="max-w-md"
      >
        <LoginForm onRegisterClick={onRegisterClick} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}