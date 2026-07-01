"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import {
  deleteProductAction,
  deleteProductImageAction,
} from "@/lib/actions/products"
import type { Product } from "@/lib/types"

interface DeleteProductModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (productId: string) => void
}

export function DeleteProductModal({
  product,
  open,
  onOpenChange,
  onDeleted,
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setIsDeleting(false)
  }, [open, product?.id])

  const handleDelete = async () => {
    if (!product) return
    setIsDeleting(true)
    const toastId = toast.loading("Eliminando plato...")
    try {
      const result = await deleteProductAction(product.id)
      if (result.error) {
        toast.error(result.error, { id: toastId })
        return
      }

      if (result.pictureUrl) {
        await deleteProductImageAction(result.pictureUrl)
      }

      onDeleted(product.id)
      toast.success("Plato eliminado", { id: toastId })
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
        title="Eliminar plato"
        subtitle={product?.name ?? ""}
        desktopMaxWidth="max-w-md"
      >
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-error/30 bg-error-container/40 p-3 text-sm text-on-error-container">
            <p className="font-semibold">Esta acción no se puede deshacer.</p>
            <p className="mt-1 text-on-surface-variant">
              Se eliminará también la imagen asociada al plato.
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
