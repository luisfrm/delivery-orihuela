"use client"

import { useState, useEffect, useCallback } from "react"
import { User } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { ProfileView } from "@/components/profile/profile-view"
import { EditProfileForm } from "@/components/forms/edit-profile-form"
import { Button } from "@/components/ui/button"

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
  const [profile, setProfile] = useState<{
    firstName: string
    lastName: string
    email: string
  } | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState("")

  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true)
    setProfileError("")
    try {
      const { getProfile } = await import("@/lib/actions/profile")
      const result = await getProfile()
      if (result?.error) {
        setProfileError(result.error)
      } else {
        setProfile(result as { firstName: string; lastName: string; email: string })
      }
    } catch {
      setProfileError("Ocurrió un error al cargar el perfil.")
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setStep("view")
      fetchProfile()
    }
  }, [open, fetchProfile])

  const handleSignOut = async () => {
    try {
      const { signOut } = await import("@/lib/actions/auth")
      const result = await signOut()
      if (!result?.error) {
        onOpenChange?.(false)
        window.location.reload()
      }
    } catch {
      // silent
    }
  }

  const handleEditSuccess = () => {
    setStep("view")
    fetchProfile()
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
        {isLoadingProfile ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="size-16 rounded-full bg-surface-container animate-pulse" />
            <div className="space-y-2 w-48">
              <div className="h-5 bg-surface-container rounded animate-pulse" />
              <div className="h-4 bg-surface-container rounded animate-pulse w-3/4 mx-auto" />
            </div>
          </div>
        ) : profileError ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-body-md text-destructive">{profileError}</p>
            <Button variant="outline" size="lg" onClick={fetchProfile}>
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
