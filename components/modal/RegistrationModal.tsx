"use client"

import { UserPlus } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { RegistrationForm } from "@/components/forms/RegistrationForm"
import { Button } from "@/components/ui/button"

interface RegistrationModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onLoginClick?: () => void
}

export function RegistrationModal({
  trigger,
  open,
  onOpenChange,
  onLoginClick,
}: RegistrationModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalTrigger asChild>
        {trigger || (
          <Button variant="primary" size="xl">
            <UserPlus className="w-5 h-5" />
            Crear cuenta
          </Button>
        )}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={<UserPlus className="size-[18px]" />}
        title="Crea tu cuenta"
        subtitle="Únete a la familia Delivery Orihuela y empieza a disfrutar."
        desktopMaxWidth="max-w-2xl"
      >
        <RegistrationForm onLoginClick={onLoginClick} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}