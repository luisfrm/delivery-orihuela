"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { UserRoleBadge } from "./UserRoleBadge"
import { deleteUser } from "@/lib/actions/users"
import { getFullName } from "@/lib/users/format"
import type { UserWithProfile } from "@/lib/types"

interface DeleteUserModalProps {
  user: UserWithProfile
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: (userId: string) => void
}

export function DeleteUserModal({
  user,
  open,
  onOpenChange,
  onDeleted,
}: DeleteUserModalProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const fullName = getFullName(user.first_name, user.last_name)

  const handleDelete = async () => {
    setIsDeleting(true)
    const toastId = toast.loading("Eliminando usuario...")
    try {
      const result = await deleteUser(user.id)
      if (result.error) {
        toast.error(result.error, { id: toastId })
        setIsDeleting(false)
        return
      }
      toast.success("Usuario eliminado", { id: toastId })
      onDeleted?.(user.id)
      router.refresh()
      onOpenChange(false)
    } catch {
      toast.error("Ocurrió un error inesperado", { id: toastId })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent
        icon={<AlertTriangle className="size-[18px]" />}
        title="Eliminar usuario"
        subtitle={user.email}
        desktopMaxWidth="max-w-md"
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-error/30 bg-error-container/40 p-3 text-sm text-on-error-container">
            <p className="font-semibold">Esta acción no se puede deshacer.</p>
            <p className="mt-1 text-on-surface-variant">
              Se eliminará también su perfil, pedidos asignados (quedarán sin
              rider) y toda la información asociada.
            </p>
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
            <p className="text-label-md text-on-surface-variant">Usuario</p>
            <p className="mt-1 text-body-md font-semibold text-on-surface">
              {fullName}
            </p>
            <p className="text-label-md text-on-surface-variant">{user.email}</p>
            <div className="mt-2">
              <UserRoleBadge role={user.role} />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-error text-on-error hover:bg-error/90"
            >
              <Trash2 className="size-4" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
