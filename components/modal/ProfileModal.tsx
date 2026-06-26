"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { ProfileView } from "@/components/profile/ProfileView"
import { EditProfileForm } from "@/components/forms/EditProfileForm"
import { NewAddressForm } from "@/components/forms/NewAddressForm"
import { AddressesManagerView } from "@/components/profile/AddressesManagerView"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/useProfile"
import { getAddresses } from "@/lib/actions/addresses"
import { UserAddress } from "@/lib/types"
import { toast } from "sonner"

interface ProfileModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type Step =
  | { kind: "view" }
  | { kind: "edit" }
  | { kind: "addresses" }
  | { kind: "address-edit"; addressId: string | null }

function BackButton({ onClick, label = "Volver" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-primary font-bold hover:underline"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      {label}
    </button>
  )
}

export function ProfileModal({
  trigger,
  open,
  onOpenChange,
}: ProfileModalProps) {
  const [step, setStep] = useState<Step>({ kind: "view" })
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [addressesLoaded, setAddressesLoaded] = useState(false)
  const { profile, isLoading, error, refresh, updateCachedProfile } = useProfile()

  useEffect(() => {
    if (
      (step.kind === "addresses" || step.kind === "address-edit") &&
      !addressesLoaded
    ) {
      async function loadAddresses() {
        const data = await getAddresses()
        setAddresses(data)
        setAddressesLoaded(true)
      }
      loadAddresses()
    }
  }, [step.kind, addressesLoaded])

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

  const handleEditSuccess = (firstName: string, lastName: string, phone: string) => {
    if (profile) {
      updateCachedProfile({ firstName, lastName, phone, email: profile.email })
    }
    setStep({ kind: "view" })
  }

  const refreshAddresses = async () => {
    const data = await getAddresses()
    setAddresses(data)
    setAddressesLoaded(true)
  }

  const handleAddressEditSuccess = async () => {
    await refreshAddresses()
    setStep({ kind: "addresses" })
  }

  let icon: React.ReactNode
  let title: string
  let subtitle: string | undefined

  if (step.kind === "edit") {
    icon = <BackButton onClick={() => setStep({ kind: "view" })} />
    title = "Editar información"
    subtitle = "Actualiza tus datos personales."
  } else if (step.kind === "addresses") {
    icon = <BackButton onClick={() => setStep({ kind: "view" })} />
    title = "Mis direcciones"
    subtitle = "Gestiona tus direcciones de entrega"
  } else if (step.kind === "address-edit") {
    icon = <BackButton onClick={() => setStep({ kind: "addresses" })} />
    title = step.addressId ? "Editar dirección" : "Nueva dirección"
    subtitle = "Modifica o completa los datos"
  } else {
    icon = <User className="size-[18px]" />
    title = "Mi Perfil"
    subtitle = undefined
  }

  let content: React.ReactNode
  if (isLoading) {
    content = (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="size-16 rounded-full bg-surface-container animate-pulse" />
        <div className="space-y-2 w-48">
          <div className="h-5 bg-surface-container rounded animate-pulse" />
          <div className="h-4 bg-surface-container rounded animate-pulse w-3/4 mx-auto" />
        </div>
      </div>
    )
  } else if (error) {
    content = (
      <div className="py-8 text-center space-y-4">
        <p className="text-body-md text-destructive">{error}</p>
        <Button variant="outline_primary" size="lg" onClick={refresh}>
          Reintentar
        </Button>
      </div>
    )
  } else if (profile && step.kind === "edit") {
    content = (
      <EditProfileForm
        initialFirstName={profile.firstName}
        initialLastName={profile.lastName}
        initialPhone={profile.phone}
        email={profile.email}
        onSuccess={handleEditSuccess}
        onCancel={() => setStep({ kind: "view" })}
      />
    )
  } else if (profile && step.kind === "addresses") {
    content = (
      <AddressesManagerView
        onEditAddress={(id) => setStep({ kind: "address-edit", addressId: id })}
        onAddAddress={() => setStep({ kind: "address-edit", addressId: null })}
        onBack={() => setStep({ kind: "view" })}
      />
    )
  } else if (profile && step.kind === "address-edit") {
    const existing = step.addressId
      ? addresses.find((a) => a.id === step.addressId) ?? null
      : null
    content = (
      <NewAddressForm
        existing={existing ?? undefined}
        onSuccess={() => handleAddressEditSuccess()}
        onCancel={() => setStep({ kind: "addresses" })}
      />
    )
  } else if (profile) {
    content = (
      <ProfileView
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={profile.email}
        onEdit={() => setStep({ kind: "edit" })}
        onManageAddresses={() => setStep({ kind: "addresses" })}
        onSignOut={handleSignOut}
      />
    )
  } else {
    content = null
  }

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
        {content}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
