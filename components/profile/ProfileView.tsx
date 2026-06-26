"use client"

import { User, MapPin, CreditCard, LogOut, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ProfileViewProps {
  firstName: string
  lastName: string
  email: string
  onEdit: () => void
  onManageAddresses: () => void
  onSignOut: () => void
}

function getInitials(firstName: string, lastName: string) {
  const first = firstName?.charAt(0)?.toUpperCase() ?? ""
  const last = lastName?.charAt(0)?.toUpperCase() ?? ""
  return first || last ? `${first}${last}` : "?"
}

export function ProfileView({
  firstName,
  lastName,
  email,
  onEdit,
  onManageAddresses,
  onSignOut,
}: ProfileViewProps) {
  const initials = getInitials(firstName, lastName)
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Usuario"

  return (
    <div className="py-4 space-y-2">
      <div className="flex flex-col items-center gap-3 pb-4">
        <Avatar size="lg">
          <AvatarFallback className="text-xl font-bold bg-primary-container text-on-primary-container">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-title-lg text-on-surface">{displayName}</p>
          <p className="text-body-md text-on-surface-variant">{email}</p>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-1">
        <button
          type="button"
          onClick={onEdit}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-left"
        >
          <div className="size-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <User className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-md text-on-surface font-medium">Editar información</p>
            <p className="text-label-md text-on-surface-variant truncate">
              Nombre, apellido y correo
            </p>
          </div>
          <ChevronRight className="size-5 text-on-surface-variant shrink-0" />
        </button>

        <button
          type="button"
          onClick={onManageAddresses}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-colors text-left"
        >
          <div className="size-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <MapPin className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-md text-on-surface font-medium">Direcciones</p>
            <p className="text-label-md text-on-surface-variant truncate">
              Gestiona tus direcciones de entrega
            </p>
          </div>
          <ChevronRight className="size-5 text-on-surface-variant shrink-0" />
        </button>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl opacity-50 cursor-not-allowed">
          <div className="size-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center">
            <CreditCard className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-md text-on-surface font-medium">Métodos de pago</p>
            <p className="text-label-md text-on-surface-variant truncate">
              Añade o actualiza tus tarjetas
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Próximamente
          </Badge>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="px-4 pt-2">
        <Button
          variant="outline"
          size="xl"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive"
          onClick={onSignOut}
        >
          <LogOut className="size-5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
