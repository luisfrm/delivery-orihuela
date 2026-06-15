"use client"

import { useState } from "react"
import { User } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { ProfileView } from "@/components/profile/ProfileView"
import { EditProfileForm } from "@/components/forms/EditProfileForm"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/useProfile"
import { toast } from "sonner"

interface ProfileModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type Step = "view" | "edit"

export function ProfileModal({
  trigger,
  open,
  onOpenChange,
}: ProfileModalProps) {
  const [step, setStep] = useState<Step>("view")
  const { profile, isLoading, error, refresh, updateCachedProfile } = useProfile()

  const handleSignOut = async () => {
    try {
      const { signOut } = await import("@/lib/actions/auth")
      const result = await signOut()
      if (result?.error) {
        toast.error(result.error)
        return
      }
      onOpenChange?.(false)
      window.location.reload()
    } catch {
      toast.error("No se pudo cerrar sesión. Intenta de nuevo.")
    }
  }

  const handleEditSuccess = (firstName: string, lastName: string) => {
    if (profile) {
      updateCachedProfile({ firstName, lastName, phone: profile.phone, email: profile.email })
    }
    setStep("view")
  }

  const icon = step === "edit" ? (
    <button
      type="button"
      onClick={() => setStep("view")}
      className="flex items-center gap-1 text-sm text-primary font-bold hover:underline"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Volver
    </button>
  ) : (
    <User className="size-[18px]" />
  )

  const title = step === "edit" ? "Editar información" : "Mi Perfil"

  const subtitle = step === "edit"
    ? "Actualiza tus datos personales."
    : undefined

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalTrigger asChild>
        {trigger || (
          <Button variant="primary" size="xl">
            <User className="w-5 h-5" />
            Mi Perfil
          </Button>
        )}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={icon}
        title={title}
        subtitle={subtitle}
        desktopMaxWidth="max-w-md"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="size-16 rounded-full bg-surface-container animate-pulse" />
            <div className="space-y-2 w-48">
              <div className="h-5 bg-surface-container rounded animate-pulse" />
              <div className="h-4 bg-surface-container rounded animate-pulse w-3/4 mx-auto" />
            </div>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-body-md text-destructive">{error}</p>
            <Button variant="outline" size="lg" onClick={refresh}>
              Reintentar
            </Button>
          </div>
        ) : step === "edit" && profile ? (
          <EditProfileForm
            initialFirstName={profile.firstName}
            initialLastName={profile.lastName}
            email={profile.email}
            onSuccess={handleEditSuccess}
            onCancel={() => setStep("view")}
          />
        ) : profile ? (
          <ProfileView
            firstName={profile.firstName}
            lastName={profile.lastName}
            email={profile.email}
            onEdit={() => setStep("edit")}
            onSignOut={handleSignOut}
          />
        ) : null}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
