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
import type { StoreWithMetadata } from "@/lib/types"

interface DeleteRestaurantModalProps {
  store: StoreWithMetadata
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteRestaurantModal({
  store,
  open,
  onOpenChange,
}: DeleteRestaurantModalProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const toastId = toast.loading("Eliminando restaurante...")
    try {
      const { deleteStore } = await import("@/lib/actions/stores")
      const result = await deleteStore(store.slug)
      if (result.error) {
        toast.error(result.error, { id: toastId })
        setIsDeleting(false)
        return
      }
      toast.success("Restaurante eliminado", { id: toastId })
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
        title="Eliminar restaurante"
        subtitle={store.name}
        desktopMaxWidth="max-w-md"
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-error/30 bg-error-container/40 p-3 text-sm text-on-error-container">
            <p className="font-semibold">Esta acción no se puede deshacer.</p>
            <p className="mt-1 text-on-surface-variant">
              Se eliminarán también todos los productos del menú y las imágenes
              asociadas.
            </p>
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
