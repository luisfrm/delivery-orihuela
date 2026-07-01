"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserWithProfile } from "@/lib/types"

interface UserRowActionsProps {
  user: UserWithProfile
  currentUserId: string | null
  onEdit: (user: UserWithProfile) => void
  onDelete: (user: UserWithProfile) => void
}

export function UserRowActions({
  user,
  currentUserId,
  onEdit,
  onDelete,
}: UserRowActionsProps) {
  const isSelf = user.id === currentUserId
  const isClient = user.role === "user"
  const deleteDisabled = isSelf || isClient
  const deleteLabel = isSelf
    ? "No puedes eliminarte"
    : isClient
      ? "Clientes no se pueden eliminar"
      : "Eliminar"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Opciones del usuario"
        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface transition-transform hover:bg-surface-container-high hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Pencil className="size-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(user)}
          disabled={deleteDisabled}
        >
          <Trash2 className="size-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
