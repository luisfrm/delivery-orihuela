"use client"

import { useState, type ReactNode } from "react"
import { Pencil, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal"
import { UserForm } from "./UserForm"
import type { UserWithProfile } from "@/lib/types"

interface UserFormModalProps {
  mode: "create" | "edit"
  user?: UserWithProfile
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: (user: UserWithProfile) => void
}

export function UserFormModal({
  mode,
  user,
  trigger,
  open,
  onOpenChange,
  onSaved,
}: UserFormModalProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(false)

  const actualOpen = isControlled ? open : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const isEditing = mode === "edit"

  return (
    <ResponsiveModal open={actualOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalTrigger asChild>
        {trigger ??
          (isEditing ? (
            <span />
          ) : (
            <Button type="button" variant="primary" size="default">
              <UserPlus className="size-4" />
              Nuevo usuario
            </Button>
          ))}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={
          isEditing ? (
            <Pencil className="size-[18px]" />
          ) : (
            <UserPlus className="size-[18px]" />
          )
        }
        title={isEditing ? "Editar usuario" : "Nuevo usuario"}
        subtitle={
          isEditing
            ? "Modifica la información del miembro del equipo"
            : "Crea un administrador o repartidor"
        }
        desktopMaxWidth="max-w-2xl"
      >
        <UserForm
          key={isEditing ? user?.id ?? "edit" : "create"}
          mode={mode}
          user={user}
          onClose={() => handleOpenChange(false)}
          onSaved={onSaved}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
